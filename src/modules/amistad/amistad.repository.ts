import { AppDataSource } from "../../database/data-source";
import { Amistad } from "./amistades.entity";

export const AmistadRepository = AppDataSource.getRepository(Amistad);
