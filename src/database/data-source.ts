import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { Usuario } from "../modules/usuario/usuario.entity.js";
import { Sala } from "../modules/sala/sala.entity.js";
import { Review } from "../modules/review/review.entity.js";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true, // 
    logging: true,     
    entities: [Usuario, Sala, Review], // Registramos tus 3 entidades aquí
    subscribers: [],
    migrations: [],
});
