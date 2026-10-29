import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { AppDataSource } from "./data-source";
import { User } from "../modules/user/user.entity";
import { Sala } from "../modules/sala/sala.entity";
import { Predio } from "../modules/predio/predio.entity";
import { Cancha } from "../modules/predio/cancha.entity";
import { ParticipacionSala } from "../modules/participacionSala/participacionSala.entity";
import {
    POSICION_CANCHA,
    ESTADO_SALA,
    ROL_EN_SALA,
    ESTADO_PARTICIPACION,
    ORIGEN_INGRESO,
    TIPO_FUTBOL,
    TIPO_SUPERFICIE,
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

const PREDIOS_DATA = [
    // 15 de Posadas
    { nombre: "Complejo La Cantera", direccion: "Av. Jauretche y Comandante Rosales", localidad: "Posadas, Misiones", lat: -27.3820, lng: -55.9320, telefono: "3764-112233" },
    { nombre: "Complejo La Costa / El Brete", direccion: "Av. Costanera y Bahía El Brete", localidad: "Posadas, Misiones", lat: -27.3560, lng: -55.8880, telefono: "3764-223344" },
    { nombre: "Complejo Deportivo El Tiro", direccion: "Av. Tambor de Tacuarí 3800", localidad: "Posadas, Misiones", lat: -27.3755, lng: -55.9180, telefono: "3764-334455" },
    { nombre: "Club Guaraní Antonio Franco (Sintético)", direccion: "Ramón García 190, Villa Sarita", localidad: "Posadas, Misiones", lat: -27.3550, lng: -55.8920, telefono: "3764-445566" },
    { nombre: "Club Bartolomé Mitre", direccion: "La Rioja y Jujuy, Barrio Rocamora", localidad: "Posadas, Misiones", lat: -27.3760, lng: -55.9010, telefono: "3764-556677" },
    { nombre: "Complejo El Galpón Fútbol 5", direccion: "Av. Lavalle y Av. Quaranta", localidad: "Posadas, Misiones", lat: -27.3990, lng: -55.9250, telefono: "3764-667788" },
    { nombre: "La Máquina Fútbol 5", direccion: "Av. López y Planes y Av. San Martín", localidad: "Posadas, Misiones", lat: -27.3740, lng: -55.9120, telefono: "3764-778899" },
    { nombre: "Complejo El Monumental Posadas", direccion: "Av. Santa Catalina y Av. Chacabuco", localidad: "Posadas, Misiones", lat: -27.3810, lng: -55.9080, telefono: "3764-889900" },
    { nombre: "Complejo Maracaná Posadas", direccion: "Av. Uruguay y Av. Comandante Espora", localidad: "Posadas, Misiones", lat: -27.3860, lng: -55.8990, telefono: "3764-990011" },
    { nombre: "Itapúa Tenis Club - Canchas Sintéticas", direccion: "Calle Belgrano y Rioja, Centro", localidad: "Posadas, Misiones", lat: -27.3680, lng: -55.8950, telefono: "3764-102030" },
    { nombre: "Complejo Arena Posadas", direccion: "Av. Rademacher y Av. Cabred", localidad: "Posadas, Misiones", lat: -27.3840, lng: -55.8910, telefono: "3764-203040" },
    { nombre: "El Pinar Fútbol", direccion: "Av. Urquiza y Av. Zapiola", localidad: "Posadas, Misiones", lat: -27.3685, lng: -55.9290, telefono: "3764-304050" },
    { nombre: "Complejo La Quinta Posadas", direccion: "Av. Quaranta cerca de Rotonda", localidad: "Posadas, Misiones", lat: -27.4080, lng: -55.9140, telefono: "3764-405060" },
    { nombre: "Complejo San Isidro Posadas", direccion: "Zona San Isidro / Ojo de Agua", localidad: "Posadas, Misiones", lat: -27.4320, lng: -55.9220, telefono: "3764-506070" },
    { nombre: "Itaembé Guazú Sports", direccion: "Barrio Itaembé Guazú", localidad: "Posadas, Misiones", lat: -27.4210, lng: -55.9920, telefono: "3764-607080" },
    // 5 fuera de rango (para validación de filtros de distancia)
    { nombre: "Complejo La Terraza Garupá", direccion: "Av. Las Américas, Garupá", localidad: "Garupá, Misiones", lat: -27.4820, lng: -55.8350, telefono: "3764-708090" },
    { nombre: "Club Atlético Candelaria", direccion: "Calle Anastasio Cabrera s/n", localidad: "Candelaria, Misiones", lat: -27.4610, lng: -55.7480, telefono: "3764-809001" },
    { nombre: "Complejo El Recreo Santa Ana", direccion: "Ruta Nacional 12 km 1380", localidad: "Santa Ana, Misiones", lat: -27.3710, lng: -55.5820, telefono: "3764-900112" },
    { nombre: "Complejo La Chacra Apóstoles", direccion: "Av. San Martín 1500", localidad: "Apóstoles, Misiones", lat: -27.9140, lng: -55.7590, telefono: "3764-011223" },
    { nombre: "Oberá Fútbol & Tenis", direccion: "Av. Sarmiento y Ucrania", localidad: "Oberá, Misiones", lat: -27.4870, lng: -55.1220, telefono: "3764-122334" },
];

const NOMBRES_PARTIDOS = [
    "Picadito de los Martes", "Fútbol 5 nocturno", "Desafío de Viernes", "Clásico de Barrio",
    "Picadito After Office", "Fútbol 7 entre amigos", "Los Galácticos F5", "Torneo Relámpago",
    "Picado intenso F5", "Fútbol 5 relax", "Superclásico de Villa Sarita", "Fútbol 7 mixto",
    "Picadito fin de semana", "Desquite del Martes", "Fútbol y tereré posterior", "Picadito con los pibes",
    "Fútbol 5 bajo techo", "Clásico de la Costanera", "Desafío Tacuarí", "Fútbol 7 nocturno El Brete",
    "Picadito de la noche", "Fútbol 5 nivel medio", "Picadito competitivo", "Copa Amistad F5",
    "Fútbol 5 Rocamora", "Picado de zurdos y diestros", "Fútbol 7 fin de semana", "Torneo relámpago nocturno",
    "Fútbol 5 Quaranta", "Picadito de mediodía", "Fútbol 5 El Pinar", "Desafío San Isidro",
    "Fútbol 7 Itaembé Guazú", "Picadito Centro", "Fútbol 5 Rademacher", "Picado de los Miércoles",
    "Fútbol 7 Costanera Sur", "Picadito de los Jueves", "Fútbol 5 After Office II", "Super picadito de Sábado",
    "Picadito dominguero", "Fútbol 5 relámpago", "Clásico Guaraní vs Mitre F5", "Picadito Urquiza",
    "Fútbol 5 La Cantera", "Picadito Villa Sarita", "Desafío de Titanes F5", "Fútbol 5 Express",
    "Picadito nocturno Tambor de Tacuarí", "Fútbol 7 Garupá", "Picado amigos de Posadas",
    "Fútbol 5 San Martín", "Picadito viernes a la noche", "Copa de Campeones F5", "Picadito de despedida",
];

export async function runSeed() {
    console.log("🌱 Iniciando seeder para unPicadito (Posadas, Misiones)...");
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const predioRepo = AppDataSource.getRepository(Predio);
    const canchaRepo = AppDataSource.getRepository(Cancha);
    const salaRepo = AppDataSource.getRepository(Sala);
    const partRepo = AppDataSource.getRepository(ParticipacionSala);

    // 1. Crear Predios y Canchas
    console.log("🏟️ Creando predios y canchas...");
    const prediosGuardados: Predio[] = [];
    const canchasGuardadas: Cancha[] = [];

    for (const pData of PREDIOS_DATA) {
        let predio = await predioRepo.findOne({ where: { nombre: pData.nombre } });
        if (!predio) {
            predio = predioRepo.create({
                nombre: pData.nombre,
                direccion: pData.direccion,
                localidad: pData.localidad,
                telefono: pData.telefono,
                ubicacion: `POINT(${pData.lng} ${pData.lat})` as any,
                activo: true,
            });
            predio = await predioRepo.save(predio);
        }
        prediosGuardados.push(predio);

        // Crear 2 o 3 canchas por predio
        const canchasExistentes = await canchaRepo.find({ where: { predio: { id: predio.id } } });
        if (canchasExistentes.length === 0) {
            const c1 = await canchaRepo.save(canchaRepo.create({
                nombre: "Cancha 1",
                tipoFutbol: TIPO_FUTBOL.FUTBOL_5,
                superficie: TIPO_SUPERFICIE.SINTETICO,
                techada: false,
                iluminacion: true,
                cuposRecomendados: 10,
                activa: true,
                predio,
            }));
            const c2 = await canchaRepo.save(canchaRepo.create({
                nombre: "Cancha 2 (Techada)",
                tipoFutbol: TIPO_FUTBOL.FUTBOL_5,
                superficie: TIPO_SUPERFICIE.SINTETICO,
                techada: true,
                iluminacion: true,
                cuposRecomendados: 10,
                activa: true,
                predio,
            }));
            const c3 = await canchaRepo.save(canchaRepo.create({
                nombre: "Cancha 3 (Fútbol 7)",
                tipoFutbol: TIPO_FUTBOL.FUTBOL_7,
                superficie: TIPO_SUPERFICIE.SINTETICO,
                techada: false,
                iluminacion: true,
                cuposRecomendados: 14,
                activa: true,
                predio,
            }));
            canchasGuardadas.push(c1, c2, c3);
        } else {
            canchasGuardadas.push(...canchasExistentes);
        }
    }
    console.log(`✅ ${prediosGuardados.length} predios y ${canchasGuardadas.length} canchas listas.`);

    // 2. Crear Usuarios
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
    console.log(`✅ Total de usuarios disponibles: ${todosLosUsuarios.length}`);

    // 3. Crear Salas asociadas a Canchas reales
    console.log("⚽ Creando salas asociadas a canchas y asignando participantes...");
    const ahora = new Date();
    const salasCreadas: Sala[] = [];

    // Priorizar canchas de Posadas (las primeras 15 * 3 = 45 canchas) y algunas fuera de rango
    for (let i = 0; i < NOMBRES_PARTIDOS.length; i++) {
        const nombreSala = NOMBRES_PARTIDOS[i];
        const cancha = canchasGuardadas[i % canchasGuardadas.length];
        const predio = prediosGuardados.find((p) => p.id === (cancha.predio?.id || (cancha as any).predio_id)) || prediosGuardados[i % prediosGuardados.length];

        const diasAdelante = 1 + (i % 24);
        const horaPartido = 18 + (i % 5); // 18hs a 22hs
        const fechaPartido = new Date(ahora.getTime() + diasAdelante * 24 * 60 * 60 * 1000);
        fechaPartido.setHours(horaPartido, 0, 0, 0);

        const cuposTotales = cancha.cuposRecomendados || 10;
        const esPublica = i % 4 !== 0; // 75% públicas, 25% privadas
        const permiteSuplentes = i % 3 !== 0;
        const creador = todosLosUsuarios[i % todosLosUsuarios.length];

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

        const sala = salaRepo.create({
            nombre: nombreSala,
            descripcion: `Picadito con amigos en ${predio.nombre} (${cancha.nombre}). Traer buena onda y puntualidad.`,
            nombreCancha: cancha.nombre,
            direccion: predio.direccion,
            cancha: { id: cancha.id },
            fechaHoraPartido: fechaPartido,
            duracionMinutos: 60,
            cuposTotales,
            permiteSuplentes,
            cuposSuplentesMax: 4,
            esPublica,
            ubicacion: predio.ubicacion as any,
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

        const usuariosRestantes = todosLosUsuarios.filter((u) => u.id !== creador.id);
        const candidatos = [...usuariosRestantes].sort(() => 0.5 - Math.random());

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
    console.log(`🏟️ Predios creados: ${prediosGuardados.length}`);
    console.log(`⚽ Canchas creadas: ${canchasGuardadas.length}`);
    console.log(`👥 Total Usuarios: ${todosLosUsuarios.length}`);
    console.log(`📋 Total Salas: ${totalSalas} (${salasCreadas.length} nuevas asociadas a canchas)`);
    console.log(`📝 Total Participaciones: ${totalParticipaciones}`);
    console.log("==========================================");

    await AppDataSource.destroy();
}

if (process.argv[1] && process.argv[1].includes("seed")) {
    runSeed().catch((err) => {
        console.error("❌ Error en seeder:", err);
        process.exit(1);
    });
}
