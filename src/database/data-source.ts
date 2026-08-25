import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Usuario } from "../modules/usuario/usuario.entity";
import { Amistad } from "../modules/amistad/amistades.entity";
import { Sala } from "../modules/sala/sala.entity";
import { ParticipacionSala } from "../modules/participacionSala/participacionSala.entity";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    entities: [Usuario, Amistad, Sala, ParticipacionSala],
});