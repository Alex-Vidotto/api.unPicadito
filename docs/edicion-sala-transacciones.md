# Propuesta: edición y unión a salas con transacciones

Este documento propone una implementación futura para coordinar la edición de cupos
con las operaciones de unión. **No aplica los cambios al código fuente.**

## Objetivo y alcance

- Mantener las reglas actuales de edición: solo el creador, sala no cancelada ni
  finalizada, fecha futura y bloqueo de cambios de fecha/ubicación dentro de las
  24 horas previas.
- Hacer que editar cupos y unirse a una sala serialicen sus operaciones mediante
  una transacción y un bloqueo de la fila de la sala.
- Conservar el comportamiento actual de salas privadas: el usuario queda como
  solicitud pendiente, no como participante confirmado.
- No permitir más suplentes confirmados que `cuposSuplentesMax`.

La validación Zod actual en `sala.schema.ts` ya comprueba que la fecha de edición
sea futura y que las coordenadas estén dentro de los rangos geográficos válidos.

## Requisito para que el bloqueo funcione

Las operaciones que cambian los participantes tienen que bloquear primero la
misma fila de `Sala`, dentro de una transacción. El código de abajo protege la
edición de cupos frente a nuevas uniones. Para proteger también frente a salidas,
expulsiones y aprobaciones de solicitudes, habrá que adaptar esos servicios con
el mismo patrón antes de considerar garantizada la consistencia de los cupos.

El bloqueo no depende de tener dos administradores. Dos peticiones concurrentes
del mismo usuario también pueden coincidir.

## Imports necesarios en `sala.service.ts`

Conservar los imports que ya use el módulo y añadir los siguientes:

```ts
import { AppDataSource } from "../../database/data-source";
import { ParticipacionSala } from "../participacionSala/participacionSala.entity";
```

`Sala` ya se importa en el servicio actual.

## Propuesta para `editarSalaService`

Reemplazar la función actual por la siguiente. Primero bloquea la fila de sala;
después cuenta participantes confirmados y actualiza la sala dentro de la misma
transacción.

```ts
export const editarSalaService = async (salaId: string, userId: number, datos: EditarSalaBody) => {
    return AppDataSource.transaction(async (manager) => {
        const salaBloqueada = await manager.findOne(Sala, {
            where: { id: salaId },
            lock: { mode: "pessimistic_write" },
        });

        if (!salaBloqueada) throw errorHttp(404, "Sala no encontrada");

        const sala = await manager.findOne(Sala, {
            where: { id: salaId },
            relations: { creador: true },
        });

        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (sala.creador.id !== userId) {
            throw errorHttp(403, "Solo el creador de la sala puede editarla");
        }
        if (ESTADOS_CERRADOS.includes(sala.estado)) {
            throw errorHttp(409, `La sala se encuentra ${sala.estado}`);
        }

        const ahora = Date.now();
        const fechaPartidoNueva = datos.fechaHoraPartido ?? sala.fechaHoraPartido;
        const horasHastaElPartidoActual =
            (sala.fechaHoraPartido.getTime() - ahora) / (1000 * 60 * 60);
        const horasHastaElPartidoNuevo =
            (fechaPartidoNueva.getTime() - ahora) / (1000 * 60 * 60);

        const modificaFechaOUbicacion =
            datos.fechaHoraPartido !== undefined ||
            datos.direccion !== undefined ||
            datos.nombreCancha !== undefined ||
            datos.ubicacion !== undefined;

        if (datos.fechaHoraPartido && horasHastaElPartidoNuevo <= 0) {
            throw errorHttp(400, "La nueva fecha del partido debe ser futura");
        }

        if (
            modificaFechaOUbicacion &&
            (horasHastaElPartidoActual <= 24 || horasHastaElPartidoNuevo <= 24)
        ) {
            throw errorHttp(400, "No se pueden modificar fecha u ubicación a menos de 24 horas del partido");
        }

        const datosActualizados: Partial<Sala> = { ...datos };

        if (datos.ubicacion) {
            datosActualizados.ubicacion =
                `POINT(${datos.ubicacion.x} ${datos.ubicacion.y})` as any;
        }

        if (datos.cuposTotales !== undefined) {
            const confirmados = await manager.count(ParticipacionSala, {
                where: {
                    sala: { id: salaId },
                    estado: "CONFIRMADO",
                },
            });

            if (datos.cuposTotales < confirmados) {
                throw errorHttp(
                    409,
                    "Los cupos totales no pueden ser menores que los participantes confirmados"
                );
            }

            datosActualizados.estado =
                confirmados >= datos.cuposTotales ? "COMPLETA" : "ABIERTA";
        }

        await manager.update(Sala, salaId, datosActualizados);

        const salaActualizada = await manager.findOne(Sala, {
            where: { id: salaId },
            relations: { creador: true, participantes: { usuario: true } },
        });

        if (!salaActualizada) throw errorHttp(404, "Sala no encontrada");

        return salaActualizada;
    });
};
```

### Criterio del conteo en la edición

Este ejemplo conserva el criterio actual del servicio: todas las participaciones
con estado `CONFIRMADO` cuentan contra `cuposTotales`, incluidos suplentes y
organizador si su participación está confirmada. Si el dominio define que los
suplentes no ocupan cupos titulares, se debe ajustar el conteo y el cálculo del
estado en una tarea aparte, de manera consistente en todos los servicios.

## Propuesta para `unirseSalaService`

Reemplazar la función actual por esta versión transaccional. Mantiene el flujo de
salas privadas y comprueba el máximo de suplentes para las uniones públicas.

```ts
export const unirseSalaService = async (salaId: string, userId: number) => {
    return AppDataSource.transaction(async (manager) => {
        const sala = await manager.findOne(Sala, {
            where: { id: salaId },
            lock: { mode: "pessimistic_write" },
        });

        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (!["ABIERTA", "COMPLETA"].includes(sala.estado)) {
            throw errorHttp(409, `La sala se encuentra ${sala.estado}`);
        }

        const participacionExistente = await manager.findOne(ParticipacionSala, {
            where: {
                sala: { id: salaId },
                usuario: { id: userId },
            },
        });

        if (participacionExistente) {
            throw errorHttp(409, "Ya formas parte de esta sala");
        }

        const confirmados = await manager.count(ParticipacionSala, {
            where: {
                sala: { id: salaId },
                estado: "CONFIRMADO",
            },
        });
        const hayCupo = confirmados < sala.cuposTotales;

        if (!hayCupo && !sala.permiteSuplentes) {
            throw errorHttp(409, "La sala está completa");
        }

        if (!sala.esPublica) {
            const solicitud = manager.create(ParticipacionSala, {
                sala: { id: salaId },
                usuario: { id: userId },
                estado: "PENDIENTE",
                rol: "SOLICITANTE",
                origenIngreso: "SOLICITUD_DIRECTA",
            });

            const participacion = await manager.save(solicitud);

            return {
                mensaje: "Tu solicitud fue enviada y está pendiente de aprobación",
                requiereAprobacion: true,
                participacion,
            };
        }

        let rol: "TITULAR" | "SUPLENTE" = "TITULAR";

        if (!hayCupo) {
            const suplentesConfirmados = await manager.count(ParticipacionSala, {
                where: {
                    sala: { id: salaId },
                    estado: "CONFIRMADO",
                    rol: "SUPLENTE",
                },
            });

            if (suplentesConfirmados >= sala.cuposSuplentesMax) {
                throw errorHttp(409, "La sala alcanzó el máximo de suplentes");
            }

            rol = "SUPLENTE";
        }

        const nuevaParticipacion = manager.create(ParticipacionSala, {
            sala: { id: salaId },
            usuario: { id: userId },
            estado: "CONFIRMADO",
            rol,
            origenIngreso: "SOLICITUD_DIRECTA",
        });
        const participacion = await manager.save(nuevaParticipacion);

        if (rol === "TITULAR" && confirmados + 1 >= sala.cuposTotales) {
            await manager.update(Sala, salaId, { estado: "COMPLETA" });
        }

        return {
            mensaje: "Te uniste a la sala correctamente",
            rol,
            participacion,
        };
    });
};
```

### Sobre los suplentes y las solicitudes privadas

La unión pública comprueba `cuposSuplentesMax` al añadir un suplente confirmado.
Una solicitud privada permanece `PENDIENTE` y `SOLICITANTE`; por eso no ocupa un
cupo confirmado en este flujo. El servicio que apruebe solicitudes deberá volver
a comprobar cupos y máximo de suplentes, bajo el mismo bloqueo de sala.

Este ejemplo preserva el criterio existente para `cuposTotales` (conteo de todas
las participaciones confirmadas). Si se cambia ese criterio para separar titulares
y suplentes, deben actualizarse juntos edición, unión, salida, expulsión y
aprobación.

## Por qué usar la transacción y el bloqueo

- La transacción agrupa las lecturas, validaciones y escrituras; ante un error,
  TypeORM revierte los cambios hechos dentro de ella.
- `pessimistic_write` hace que otra operación que intente bloquear la misma fila
  espere a que termine la primera, evitando que dos uniones simultáneas lean el
  mismo cupo libre.
- El candado no es una regla de autorización: los permisos siguen comprobándose
  en el servicio.
- El candado solo coordina operaciones que usen el mismo patrón. Para mantener
  coherencia completa, adaptar las operaciones de salida, expulsión y aprobación.

## Consideraciones de implementación

- Confirmar que el motor de base de datos utilizado en el entorno soporte
  transacciones y bloqueos pesimistas. Este proyecto usa MySQL.
- No hacer llamadas externas ni esperar procesos lentos dentro de la transacción:
  el bloqueo debe mantenerse el menor tiempo posible.
- El `as any` de la ubicación sigue el patrón existente porque TypeORM tipa la
  propiedad como coordenadas, mientras que este guardado pasa el WKT
  `POINT(longitud latitud)`. Se recomienda evaluar una función de persistencia
  espacial tipada en una mejora futura.
- Agregar pruebas para: acceso no creador, sala cerrada, fecha dentro/fuera de
  24 horas, reducción de cupos debajo de confirmados, unión pública con cupo,
  unión como suplente hasta el máximo y solicitud en sala privada.
- Probar también un caso concurrente de dos uniones al último cupo para verificar
  que solo una se convierte en titular y que la otra espera y sigue la regla de
  suplentes.
