import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { AppDataSource } from "./data-source";
import { User } from "../modules/user/user.entity";
import { Sala } from "../modules/sala/sala.entity";
import { ParticipacionSala } from "../modules/participacionSala/participacionSala.entity";
import {
    POSICION_CANCHA,
    ESTADO_SALA,
    ROL_EN_SALA,
    ESTADO_PARTICIPACION,
    ORIGEN_INGRESO,
    PosicionCancha,
} from "../constants/type";

const USERS_DATA: Array<{
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    email: string;
    posicionPrincipal: PosicionCancha;
    reputacion: number;
    apodo?: string;
}> = [
    { nombre: "Lucas", apellido: "Martínez", nombreUsuario: "lucasmartinez", email: "lucas.martinez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.8, apodo: "Luquitas" },
    { nombre: "Mateo", apellido: "Rodríguez", nombreUsuario: "mateorodriguez", email: "mateo.rodriguez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.5, apodo: "El Diez" },
    { nombre: "Santiago", apellido: "Gómez", nombreUsuario: "santigomez", email: "santi.gomez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DEFENSOR, reputacion: 4.2, apodo: "El Rulo" },
    { nombre: "Joaquín", apellido: "Díaz", nombreUsuario: "joaquindiaz", email: "joaquin.diaz@unpicadito.com", posicionPrincipal: POSICION_CANCHA.ARQUERO, reputacion: 4.9, apodo: "Manos de Oro" },
    { nombre: "Nicolás", apellido: "Álvarez", nombreUsuario: "nicoalvarez", email: "nico.alvarez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.TODOTERRENO, reputacion: 4.6, apodo: "Nico" },
    { nombre: "Agustín", apellido: "Romero", nombreUsuario: "agustinromero", email: "agustin.romero@unpicadito.com", posicionPrincipal: POSICION_CANCHA.POLIFUNCIONAL, reputacion: 4.1, apodo: "El Vasco" },
    { nombre: "Tomás", apellido: "Sosa", nombreUsuario: "tomassosa", email: "tomas.sosa@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.7, apodo: "Tomi" },
    { nombre: "Facundo", apellido: "Torres", nombreUsuario: "facundotorres", email: "facundo.torres@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.3, apodo: "Facu" },
    { nombre: "Gonzalo", apellido: "Flores", nombreUsuario: "gonzaloflores", email: "gonzalo.flores@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DEFENSOR, reputacion: 4.0, apodo: "Gonza" },
    { nombre: "Ignacio", apellido: "Benítez", nombreUsuario: "nachobenitez", email: "nacho.benitez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.ARQUERO, reputacion: 4.4, apodo: "Nacho" },
    { nombre: "Martín", apellido: "Acosta", nombreUsuario: "martinacosta", email: "martin.acosta@unpicadito.com", posicionPrincipal: POSICION_CANCHA.TODOTERRENO, reputacion: 4.6, apodo: "Tincho" },
    { nombre: "Julián", apellido: "Medina", nombreUsuario: "julianmedina", email: "julian.medina@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.8, apodo: "La Araña" },
    { nombre: "Emiliano", apellido: "Herrera", nombreUsuario: "emiherrera", email: "emi.herrera@unpicadito.com", posicionPrincipal: POSICION_CANCHA.ARQUERO, reputacion: 5.0, apodo: "Dibu" },
    { nombre: "Federico", apellido: "Aguirre", nombreUsuario: "fedeaguirre", email: "fede.aguirre@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.2, apodo: "Fede" },
    { nombre: "Leandro", apellido: "Giménez", nombreUsuario: "leogimenez", email: "leo.gimenez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DEFENSOR, reputacion: 4.5, apodo: "El Muro" },
    { nombre: "Ramiro", apellido: "Molina", nombreUsuario: "ramamolina", email: "rama.molina@unpicadito.com", posicionPrincipal: POSICION_CANCHA.POLIFUNCIONAL, reputacion: 3.9, apodo: "Rama" },
    { nombre: "Esteban", apellido: "Castro", nombreUsuario: "estebancastro", email: "esteban.castro@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.4, apodo: "Tebi" },
    { nombre: "Sebastián", apellido: "Ortiz", nombreUsuario: "sebaortiz", email: "seba.ortiz@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.6, apodo: "Tanque" },
    { nombre: "Matías", apellido: "Silva", nombreUsuario: "matisilva", email: "mati.silva@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DEFENSOR, reputacion: 4.1, apodo: "Mati" },
    { nombre: "Gabriel", apellido: "Núñez", nombreUsuario: "gabriel_nunez", email: "gabriel.nunez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.ARQUERO, reputacion: 4.3, apodo: "Gabi" },
    { nombre: "Rodrigo", apellido: "Luna", nombreUsuario: "rodrigoluna", email: "rodrigo.luna@unpicadito.com", posicionPrincipal: POSICION_CANCHA.TODOTERRENO, reputacion: 4.7, apodo: "Motorcito" },
    { nombre: "Maximiliano", apellido: "Juárez", nombreUsuario: "maxijuarez", email: "maxi.juarez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.0, apodo: "Maxi" },
    { nombre: "Cristian", apellido: "Cabrera", nombreUsuario: "cristiancabrera", email: "cristian.cabrera@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.5, apodo: "Pipa" },
    { nombre: "Diego", apellido: "Ríos", nombreUsuario: "diegorios", email: "diego.rios@unpicadito.com", posicionPrincipal: POSICION_CANCHA.POLIFUNCIONAL, reputacion: 4.2, apodo: "Dieguito" },
    { nombre: "Ángel", apellido: "Morales", nombreUsuario: "angelmorales", email: "angel.morales@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.9, apodo: "Fideo" },
    { nombre: "Franco", apellido: "Godoy", nombreUsuario: "francogodoy", email: "franco.godoy@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DEFENSOR, reputacion: 4.4, apodo: "Fran" },
    { nombre: "Marcos", apellido: "Ferreyra", nombreUsuario: "marcosferreyra", email: "marcos.ferreyra@unpicadito.com", posicionPrincipal: POSICION_CANCHA.ARQUERO, reputacion: 4.1, apodo: "El Gato" },
    { nombre: "Bruno", apellido: "Domínguez", nombreUsuario: "brunodominguez", email: "bruno.dominguez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.7, apodo: "Brunito" },
    { nombre: "Manuel", apellido: "Vega", nombreUsuario: "manuelvega", email: "manuel.vega@unpicadito.com", posicionPrincipal: POSICION_CANCHA.TODOTERRENO, reputacion: 4.3, apodo: "Manu" },
    { nombre: "Iván", apellido: "Carrizo", nombreUsuario: "ivancarrizo", email: "ivan.carrizo@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.5, apodo: "Ivo" },
    { nombre: "Alan", apellido: "Suárez", nombreUsuario: "alansuarez", email: "alan.suarez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.4, apodo: "Pistolero" },
    { nombre: "Enzo", apellido: "Paz", nombreUsuario: "enzopaz", email: "enzo.paz@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.8, apodo: "Enzope" },
    { nombre: "Lautaro", apellido: "Roldán", nombreUsuario: "lautaroroldan", email: "lautaro.roldan@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DEFENSOR, reputacion: 4.2, apodo: "Toro" },
    { nombre: "Valentín", apellido: "Ojeda", nombreUsuario: "valentinojeda", email: "valentin.ojeda@unpicadito.com", posicionPrincipal: POSICION_CANCHA.POLIFUNCIONAL, reputacion: 4.1, apodo: "Valen" },
    { nombre: "Alexis", apellido: "Mendoza", nombreUsuario: "alexismendoza", email: "alexis.mendoza@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.7, apodo: "Colo" },
    { nombre: "Ezequiel", apellido: "Vargas", nombreUsuario: "ezequielvargas", email: "ezequiel.vargas@unpicadito.com", posicionPrincipal: POSICION_CANCHA.ARQUERO, reputacion: 4.3, apodo: "Eze" },
    { nombre: "Brian", apellido: "Lucero", nombreUsuario: "brianlucero", email: "brian.lucero@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DEFENSOR, reputacion: 4.0, apodo: "Braian" },
    { nombre: "Nahuel", apellido: "Quiroga", nombreUsuario: "nahuelquiroga", email: "nahuel.quiroga@unpicadito.com", posicionPrincipal: POSICION_CANCHA.TODOTERRENO, reputacion: 4.5, apodo: "Nahu" },
    { nombre: "Kevin", apellido: "Guzmán", nombreUsuario: "kevinguzman", email: "kevin.guzman@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.3, apodo: "Kev" },
    { nombre: "Thiago", apellido: "Peralta", nombreUsuario: "thiagoperalta", email: "thiago.peralta@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.6, apodo: "Thiaguito" },
    { nombre: "Bautista", apellido: "Villalba", nombreUsuario: "bautistavillalba", email: "bautista.villalba@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DEFENSOR, reputacion: 4.2, apodo: "Bauti" },
    { nombre: "Felipe", apellido: "Cardozo", nombreUsuario: "felipecardozo", email: "felipe.cardozo@unpicadito.com", posicionPrincipal: POSICION_CANCHA.ARQUERO, reputacion: 4.4, apodo: "Feli" },
    { nombre: "Benjamín", apellido: "Ledesma", nombreUsuario: "benjaminledesma", email: "benjamin.ledesma@unpicadito.com", posicionPrincipal: POSICION_CANCHA.POLIFUNCIONAL, reputacion: 4.0, apodo: "Benja" },
    { nombre: "Jerónimo", apellido: "Castillo", nombreUsuario: "jeronimocastillo", email: "jeronimo.castillo@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.7, apodo: "Jero" },
    { nombre: "Simón", apellido: "Paredes", nombreUsuario: "simonparedes", email: "simon.paredes@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.5, apodo: "Simo" },
    { nombre: "Lisandro", apellido: "Soria", nombreUsuario: "lisandrosoria", email: "lisandro.soria@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DEFENSOR, reputacion: 4.8, apodo: "Licha" },
    { nombre: "Guillermo", apellido: "Miranda", nombreUsuario: "guillermomiranda", email: "guillermo.miranda@unpicadito.com", posicionPrincipal: POSICION_CANCHA.TODOTERRENO, reputacion: 4.1, apodo: "Guille" },
    { nombre: "Agustina", apellido: "Fernández", nombreUsuario: "agusfernandez", email: "agus.fernandez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.9, apodo: "Agus" },
    { nombre: "Florencia", apellido: "López", nombreUsuario: "florlopez", email: "flor.lopez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.8, apodo: "Flor" },
    { nombre: "Camila", apellido: "García", nombreUsuario: "camilagarcia", email: "camila.garcia@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DEFENSOR, reputacion: 4.5, apodo: "Cami" },
    { nombre: "Micaela", apellido: "Pérez", nombreUsuario: "micaperez", email: "mica.perez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.ARQUERO, reputacion: 4.6, apodo: "Mica" },
    { nombre: "Luciana", apellido: "González", nombreUsuario: "lucianagonzalez", email: "luciana.gonzalez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.POLIFUNCIONAL, reputacion: 4.4, apodo: "Luli" },
    { nombre: "Paula", apellido: "Sánchez", nombreUsuario: "paulasanchez", email: "paula.sanchez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.TODOTERRENO, reputacion: 4.7, apodo: "Pau" },
    { nombre: "Valeria", apellido: "Ramírez", nombreUsuario: "valeriaramirez", email: "valeria.ramirez@unpicadito.com", posicionPrincipal: POSICION_CANCHA.MEDIOCAMPISTA, reputacion: 4.3, apodo: "Vale" },
    { nombre: "Romina", apellido: "Torres", nombreUsuario: "rominatorres", email: "romina.torres@unpicadito.com", posicionPrincipal: POSICION_CANCHA.DELANTERO, reputacion: 4.6, apodo: "Romi" },
];

const PREDIOS = [
    { nombreCancha: "Club Atlético Palermo", direccion: "Fitz Roy 2238, Palermo", lng: -58.4285, lat: -34.5812 },
    { nombreCancha: "Complejo Costa Salguero", direccion: "Av. Costanera Rafael Obligado 1221", lng: -58.3962, lat: -34.5684 },
    { nombreCancha: "Canchas El Monumental F5", direccion: "Av. Figueroa Alcorta 7597, Núñez", lng: -58.4502, lat: -34.5453 },
    { nombreCancha: "Open Gallo Fútbol", direccion: "Gallo 450, Almagro", lng: -58.4112, lat: -34.6045 },
    { nombreCancha: "Sintético Caballito", direccion: "Av. Rivadavia 5600, Caballito", lng: -58.4411, lat: -34.6198 },
    { nombreCancha: "Fútbol Urbano Villa Urquiza", direccion: "Av. Triunvirato 4200, Villa Urquiza", lng: -58.4821, lat: -34.5772 },
    { nombreCancha: "Predio La Paternal", direccion: "Av. San Martín 2800, La Paternal", lng: -58.4682, lat: -34.6021 },
    { nombreCancha: "Estadio San Telmo F5", direccion: "Perú 1200, San Telmo", lng: -58.3712, lat: -34.6215 },
    { nombreCancha: "Complejo Belgrano R", direccion: "Zapiola 1800, Belgrano", lng: -58.4651, lat: -34.5691 },
    { nombreCancha: "Parque Chacabuco Fútbol", direccion: "Emilio Mitre 1200, Parque Chacabuco", lng: -58.4398, lat: -34.6321 },
    { nombreCancha: "Canchas La Bombonera F5", direccion: "Brandsen 805, La Boca", lng: -58.3642, lat: -34.6356 },
    { nombreCancha: "Club Colegiales", direccion: "Teodoro García 2800, Colegiales", lng: -58.4523, lat: -34.5761 },
    { nombreCancha: "Solís Fútbol Club", direccion: "Solís 1450, Constitución", lng: -58.3892, lat: -34.6263 },
    { nombreCancha: "Plaza Irlanda Canchas", direccion: "Gaona 1700, Caballito", lng: -58.4519, lat: -34.6139 },
    { nombreCancha: "Complejo Barracas Central", direccion: "Olavarría 2600, Barracas", lng: -58.3854, lat: -34.6472 },
];

const NOMBRES_PARTIDOS = [
    "Picadito de los Martes",
    "Fútbol 5 nocturno",
    "Desafío de Viernes",
    "Clásico de Barrio",
    "Picadito After Office",
    "Fútbol 7 entre amigos",
    "Los Galácticos F5",
    "Torneo Relámpago",
    "Picado intenso F5",
    "Fútbol 5 relax",
    "Superclásico de Colegiales",
    "Fútbol 7 mixto",
    "Picadito fin de semana",
    "Desquite del Martes",
    "Fútbol y birra posterior",
    "Picadito con los pibes",
    "Fútbol 5 bajo techo",
    "Clásico de Núñez",
    "Desafío Villa Urquiza",
    "Fútbol 7 nocturno Palermo",
    "Picadito de la noche",
    "Fútbol 5 nivel medio",
    "Picadito competitivo",
    "Copa Amistad F5",
    "Fútbol 5 Caballito",
    "Picado de zurdos y diestros",
    "Fútbol 7 fin de semana",
    "Torneo relámpago nocturno",
    "Fútbol 5 La Paternal",
    "Picadito de mediodía",
    "Fútbol 5 Belgrano R",
    "Desafío Parque Chacabuco",
    "Fútbol 7 Almagro",
    "Picadito San Telmo",
    "Fútbol 5 Barracas",
    "Picado de los Miércoles",
    "Fútbol 7 Colegiales",
    "Picadito de los Jueves",
    "Fútbol 5 After Office II",
    "Super picadito de Sábado",
    "Picadito dominguero",
    "Fútbol 5 relámpago",
    "Clásico de La Boca",
    "Picadito Plaza Irlanda",
    "Fútbol 5 Costanera",
    "Picadito Palermo Hollywood",
    "Desafío de Titanes F5",
    "Fútbol 5 Núñez Express",
    "Picadito nocturno Triunvirato",
    "Fútbol 7 Bajo Belgrano",
    "Picado amigos de Palermo",
    "Fútbol 5 San Martín",
    "Picadito viernes a la noche",
    "Copa de Campeones F5",
    "Picadito de despedida",
];

export async function runSeed() {
    console.log("🌱 Iniciando seeder para unPicadito...");
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const salaRepo = AppDataSource.getRepository(Sala);
    const partRepo = AppDataSource.getRepository(ParticipacionSala);

    // 1. Crear usuarios
    console.log("👤 Creando usuarios...");
    const passwordHash = await bcrypt.hash("123456", 10);
    const todosLosUsuarios: User[] = await userRepo.find();

    const emailsExistentes = new Set(todosLosUsuarios.map((u) => u.email.toLowerCase()));
    const usernamesExistentes = new Set(todosLosUsuarios.map((u) => u.nombreUsuario.toLowerCase()));

    for (const userData of USERS_DATA) {
        if (emailsExistentes.has(userData.email.toLowerCase()) || usernamesExistentes.has(userData.nombreUsuario.toLowerCase())) {
            continue;
        }

        const nuevoUsuario = userRepo.create({
            ...userData,
            passwordHash,
            fotoPerfilUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.nombreUsuario}`,
            saldoCredito: 1000.0,
        });

        const guardado = await userRepo.save(nuevoUsuario);
        todosLosUsuarios.push(guardado);
        emailsExistentes.add(userData.email.toLowerCase());
        usernamesExistentes.add(userData.nombreUsuario.toLowerCase());
    }

    console.log(`✅ Total de usuarios disponibles en base de datos: ${todosLosUsuarios.length}`);

    // 2. Crear salas (mínimo 55 salas)
    console.log("⚽ Creando salas y asignando participantes...");
    const salasCreadas: Sala[] = [];
    const ahora = new Date();

    for (let i = 0; i < NOMBRES_PARTIDOS.length; i++) {
        const nombreSala = NOMBRES_PARTIDOS[i];
        const predio = PREDIOS[i % PREDIOS.length];

        // Fechas a futuro: entre mañana y dentro de 25 días
        const diasAdelante = 1 + (i % 24);
        const horaPartido = 18 + (i % 5); // 18hs a 22hs
        const fechaPartido = new Date(ahora.getTime() + diasAdelante * 24 * 60 * 60 * 1000);
        fechaPartido.setHours(horaPartido, (i % 2 === 0 ? 0 : 30), 0, 0);

        const cuposTotales = i % 5 === 0 ? 14 : 10;
        const esPublica = i % 4 !== 0; // 75% públicas, 25% privadas
        const permiteSuplentes = i % 3 !== 0;
        const creador = todosLosUsuarios[i % todosLosUsuarios.length];

        // Determinar cantidad de participantes deseados:
        // - Primeras 8 salas: LLENAS (estado COMPLETA)
        // - Siguientes 15: CASI LLENAS (7 a 9 jugadores)
        // - Siguientes 18: MEDIO LLENAS (4 a 6 jugadores)
        // - Restantes: INICIANDO (2 a 3 jugadores)
        let jugadoresConfirmadosMeta: number;
        if (i < 8) {
            jugadoresConfirmadosMeta = cuposTotales;
        } else if (i < 23) {
            jugadoresConfirmadosMeta = Math.min(cuposTotales - 1, 7 + (i % 3));
        } else if (i < 41) {
            jugadoresConfirmadosMeta = 4 + (i % 3);
        } else {
            jugadoresConfirmadosMeta = 2 + (i % 2);
        }

        const estadoSala = jugadoresConfirmadosMeta >= cuposTotales ? ESTADO_SALA.COMPLETA : ESTADO_SALA.ABIERTA;

        // Crear la sala
        const sala = salaRepo.create({
            nombre: nombreSala,
            descripcion: `Picadito recreativo y con buena onda en ${predio.nombreCancha}. Se pide puntualidad y buena predisposición.`,
            nombreCancha: predio.nombreCancha,
            direccion: predio.direccion,
            fechaHoraPartido: fechaPartido,
            duracionMinutos: 60,
            cuposTotales,
            permiteSuplentes,
            cuposSuplentesMax: 4,
            esPublica,
            ubicacion: `POINT(${predio.lng} ${predio.lat})` as any,
            estado: estadoSala,
            creador,
        });

        const salaGuardada = await salaRepo.save(sala);
        salasCreadas.push(salaGuardada);

        // Inscribir al creador como ORGANIZADOR CONFIRMADO
        await partRepo.save(partRepo.create({
            sala: salaGuardada,
            usuario: creador,
            rol: ROL_EN_SALA.ORGANIZADOR,
            estado: ESTADO_PARTICIPACION.CONFIRMADO,
            origenIngreso: ORIGEN_INGRESO.SOLICITUD_DIRECTA,
        }));

        // Seleccionar otros participantes sin repetir
        const usuariosRestantes = todosLosUsuarios.filter((u) => u.id !== creador.id);
        // Shuffle simple determinista por índice de sala
        const candidatos = [...usuariosRestantes].sort(() => 0.5 - Math.random());

        // Inscribir titulares hasta cumplir jugadoresConfirmadosMeta (creador ya cuenta como 1)
        const titularesAInscribir = jugadoresConfirmadosMeta - 1;
        let indexCandidato = 0;

        for (let t = 0; t < titularesAInscribir && indexCandidato < candidatos.length; t++) {
            const jugador = candidatos[indexCandidato++];
            await partRepo.save(partRepo.create({
                sala: salaGuardada,
                usuario: jugador,
                rol: ROL_EN_SALA.TITULAR,
                estado: ESTADO_PARTICIPACION.CONFIRMADO,
                origenIngreso: ORIGEN_INGRESO.SOLICITUD_DIRECTA,
            }));
        }

        // Si la sala está completa y permite suplentes, agregamos 1 o 2 suplentes en algunas salas
        if (estadoSala === ESTADO_SALA.COMPLETA && permiteSuplentes && i % 2 === 0) {
            const suplentesAInscribir = 1 + (i % 2);
            for (let s = 0; s < suplentesAInscribir && indexCandidato < candidatos.length; s++) {
                const suplente = candidatos[indexCandidato++];
                await partRepo.save(partRepo.create({
                    sala: salaGuardada,
                    usuario: suplente,
                    rol: ROL_EN_SALA.SUPLENTE,
                    estado: ESTADO_PARTICIPACION.CONFIRMADO,
                    origenIngreso: ORIGEN_INGRESO.SOLICITUD_DIRECTA,
                }));
            }
        }

        // Si la sala es privada, agregamos 1 o 2 solicitudes pendientes para probar aprobaciones
        if (!esPublica && indexCandidato < candidatos.length) {
            const solicitudesAInscribir = 1 + (i % 2);
            for (let p = 0; p < solicitudesAInscribir && indexCandidato < candidatos.length; p++) {
                const solicitante = candidatos[indexCandidato++];
                await partRepo.save(partRepo.create({
                    sala: salaGuardada,
                    usuario: solicitante,
                    rol: ROL_EN_SALA.SOLICITANTE,
                    estado: ESTADO_PARTICIPACION.PENDIENTE,
                    origenIngreso: ORIGEN_INGRESO.SOLICITUD_DIRECTA,
                }));
            }
        }
    }

    const totalSalas = await salaRepo.count();
    const totalParticipaciones = await partRepo.count();

    console.log("==========================================");
    console.log(`🎉 Seeder completado con éxito!`);
    console.log(`👥 Total Usuarios: ${todosLosUsuarios.length}`);
    console.log(`🏟️ Total Salas: ${totalSalas} (creadas ${salasCreadas.length} en este lote)`);
    console.log(`📝 Total Participaciones: ${totalParticipaciones}`);
    console.log(`🔑 Contraseña general para todos los usuarios: 123456`);
    console.log("==========================================");

    await AppDataSource.destroy();
}

if (process.argv[1] && process.argv[1].includes("seed")) {
    runSeed().catch((err) => {
        console.error("❌ Error en seeder:", err);
        process.exit(1);
    });
}
