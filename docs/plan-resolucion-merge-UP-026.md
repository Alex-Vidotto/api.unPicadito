# Plan para resolver el merge de UP-018 con UP-026

## Objetivo

Integrar en `UP-018` la actualización de `dev` (`946e99b`, PR #21, transferencia del rol de organizador) sin perder las capacidades que ya aporta `UP-018`. El plan fue aplicado en los cinco archivos de sala en conflicto; el merge queda sin commit para revisión final.

## Estado observado

- Rama actual: `UP-018`.
- Rama entrante: `dev`, con la funcionalidad de transferencia de organizador de `UP-026`.
- Git mantiene el merge en curso (`MERGE_HEAD` presente).
- Los conflictos de contenido en `src/modules/sala/sala.controller.ts`, `sala.repository.ts`, `sala.routes.ts`, `sala.schema.ts` y `sala.service.ts` fueron resueltos y preparados en el índice.
- `package.json` y `package-lock.json` ya presentan cambios preparados; revisarlos como una unidad antes de aceptar el merge.
- Existe `docs/edicion-sala-transacciones.md`, que contiene una propuesta relacionada con transacciones. Conservarlo; este plan no lo reemplaza.

## Resultado de la aplicación

- Se conservaron los endpoints de detalle y edición, y se integró la ruta de transferencia con autenticación y validación de parámetros/cuerpo.
- Se mantuvieron las transacciones y bloqueos pesimistas de edición, unión, salida y expulsión. La cancelación valida al organizador confirmado.
- La transferencia valida al organizador actual y al nuevo participante confirmado, y actualiza ambos roles en una sola transacción.
- `npm run build` no pudo finalizar por errores preexistentes fuera del módulo de salas: errores en `src/modules/amistad/amistad.controller.ts`, `amistad.repository.ts`, `amistad.service.ts`, `src/modules/friendship/friendship.service.ts` y `src/modules/user/user.service.ts`. No se encontraron errores de compilación en los archivos de sala modificados.
- No se creó un commit. El merge permanece preparado para revisión y confirmación.

## Capacidades que deben quedar en la combinación

### De UP-018

- Obtener el detalle de una sala (`GET /:id`).
- Editar una sala (`PATCH /:id`), incluidas sus reglas de fecha, ubicación, cupos y estado.
- Mantener las operaciones de unirse y salir de una sala, expulsar participantes y cancelar.
- Mantener la protección transaccional y el bloqueo pesimista que UP-018 incorpora para la edición, la unión y la salida, evitando condiciones de carrera en cupos y estados.
- Conservar el esquema de errores y respuestas que actualmente consumen los clientes de esta rama.

### De UP-026

- Transferir el rol de organizador mediante `PATCH /:id/transferir-organizador`.
- Validar la identidad del usuario y la participación confirmada del nuevo organizador.
- Usar el rol de organizador en las verificaciones de permisos que la actualización entrante cambia, en particular cancelación y expulsión.
- Conservar los helpers de persistencia requeridos para consultar organizador/participaciones y actualizar roles, adaptándolos al manejo transaccional acordado.

## Secuencia propuesta

1. **Resolver primero los contratos de API.** En `sala.routes.ts`, conservar las rutas locales de detalle y edición y agregar la ruta de transferencia entrante. Mantener autenticación y validación de parámetros y cuerpos para cada endpoint; validar también el UUID de la sala en cancelación y transferencia.
2. **Unificar los esquemas.** En `sala.schema.ts`, retener los esquemas y tipos de edición y búsqueda que usa UP-018, además de los tipos y la validación del cuerpo de transferencia de UP-026. Evitar definiciones duplicadas o referencias a nombres antiguos.
3. **Unificar los controladores.** Mantener handlers para detalle, edición, salida y expulsión/cancelación, y agregar el handler de transferencia. Elegir un patrón de manejo de errores coherente con el resto de la aplicación; preservar códigos HTTP y la forma `{ success, data }`/`{ success, message }` que espera la API. No dejar handlers de rutas sin exportar ni validaciones duplicadas con efectos distintos.
4. **Combinar el repositorio.** Conservar las consultas y escrituras ya usadas por edición y participantes, e integrar las consultas de organizador y actualización de rol. Para transferir roles dentro de una transacción, hacer que las operaciones usen el mismo `EntityManager`/repositorio transaccional; no mezclar consultas del repositorio global con escrituras transaccionales.
5. **Combinar las reglas del servicio.**
   - Preservar las reglas y transacciones de edición, unión y salida de UP-018.
   - Mantener la autorización por organizador de UP-026 en cancelación y expulsión, comprobando además sala existente y estado abierto.
   - Implementar transferencia solo entre el organizador actual y una participación confirmada distinta, dentro de una única transacción: el organizador anterior pasa a titular y el nuevo recibe el rol de organizador.
   - Mantener la regla actual de edición de UP-018 (solo creador) salvo que el equipo decida explícitamente cambiar ese permiso; no ampliarlo implícitamente al transferir organizador.
   - Mantener respuestas y códigos de errores conocidos, evitando que errores inesperados se conviertan en éxitos o expongan detalles internos.
6. **Revisar la consistencia de tipos y dependencias.** Confirmar que los roles usados en servicios y entidades coinciden con `RolEnSala`, que todas las funciones importadas existen y que los cambios de `package.json` están reflejados correctamente en `package-lock.json`.
7. **Verificar el resultado antes de marcar resuelto el merge.** Buscar marcadores de conflicto, compilar, revisar el diff final y comprobar los flujos listados abajo. Solo después de esas verificaciones, preparar los archivos resueltos y completar el merge.

## Defecto que debe corregirse al aplicar el merge

La implementación entrante de `transferirOrganizadorService` consulta al organizador actual y luego aplica tanto el cambio a `"TITULAR"` como el cambio a `"ORGANIZADOR"` usando el ID de esa misma participación. No actualiza la participación de `nuevoOrganizadorId`, aunque el repositorio ya dispone de una consulta para localizar su participación confirmada. En ese estado, la transferencia no ocurre y la respuesta puede afirmar incorrectamente que sí.

Al implementar el paso 5, localizar y validar la participación confirmada del nuevo organizador y actualizar ambas participaciones atómicamente. Si la validación o una escritura falla, revertir la transacción. Añadir una prueba que compruebe que cambian los roles de ambas personas y que queda exactamente un organizador confirmado.

## Criterios de aceptación

- Se conservan las rutas de búsqueda, detalle, creación, unión, salida, cancelación, expulsión y edición que corresponden a la rama combinada; se agrega transferencia de organizador.
- Cada ruta protegida mantiene `authenticateJWT` y valida los parámetros/cuerpo pertinentes antes de ejecutar el controlador.
- Sala inexistente, sala cerrada, transferencia a sí mismo, usuario no organizador o nuevo organizador no confirmado producen el error de negocio correspondiente y no modifican roles.
- Una transferencia válida deja al organizador anterior como titular y al destino como único organizador confirmado.
- La cancelación y expulsión respetan el permiso del organizador definido por UP-026; la edición mantiene la autorización de creador de UP-018.
- La unión y salida mantienen las comprobaciones de cupo, suplentes y transición entre `ABIERTA`/`COMPLETA`, protegidas contra carreras por transacción/bloqueo.
- La edición mantiene restricciones de fecha/ubicación, cupos y estado.
- No quedan marcadores `<<<<<<<`, `=======` o `>>>>>>>` ni conflictos sin resolver en el índice.
- `npm run build` termina correctamente. Añadir/ejecutar pruebas dirigidas para permisos, transferencia atómica, límites de cupo y validación de rutas; si el repositorio aún no tiene suite configurada, dejar documentadas las comprobaciones manuales realizadas.

## Comprobaciones sugeridas

1. Revisar `git status` y `git diff --check`.
2. Buscar marcadores de conflicto en `src/modules/sala/`.
3. Ejecutar `npm run build`.
4. Probar transferencia válida e inválida y volver a consultar las participaciones para verificar los roles persistidos.
5. Probar edición, unión, salida, cancelación y expulsión con usuario autorizado y no autorizado.
6. Revisar que el diff no haya eliminado endpoints, validaciones ni cambios de respuesta ajenos a la resolución del conflicto.
