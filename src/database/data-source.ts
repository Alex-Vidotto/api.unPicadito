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
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "BDPicadito",
    synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
    logging: true,
    entities: [Usuario, Amistad, Sala, ParticipacionSala],
    migrations: [],
    subscribers: [],
});