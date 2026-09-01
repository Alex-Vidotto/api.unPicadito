import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../modules/user/user.entity.js";
import { Sala } from "../modules/sala/sala.entity.js";
import { Review } from "../modules/review/review.entity.js";
import { Amistad } from "../modules/amistad/amistades.entity.js";
import { ParticipacionSala } from "../modules/participacionSala/participacionSala.entity.js";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "un_picadito_db",
    synchronize: true,
    entities: [User, Amistad, Sala, ParticipacionSala, Review],
});
