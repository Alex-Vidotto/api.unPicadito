import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import express from "express";
import reviewRoutes from "./modules/review/review.routes";
import friendshipRoutes from "./modules/amistad/amistad.routes";
import { AppDataSource } from "./database/data-source";

const app = express();
app.use("/api/reviews", reviewRoutes);
app.use(express.json());
app.use("/api", friendshipRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Base de datos conectada");
    app.listen(process.env.PORT || 8080, () => {
      console.log(`Servidor en puerto ${process.env.PORT || 8080}`);
    });
  })
  .catch((err: Error) => {
    console.error("Error al conectar:", err);
    process.exit(1);
  });
