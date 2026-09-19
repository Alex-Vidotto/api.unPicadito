import express from "express";
import dotenv from "dotenv";
//import cors from 'cors'; 
import friendshipRoutes from "./modules/friendship/friendship.routes";
import { AppDataSource } from "./database/data-source";
import reviewRoutes from "./modules/review/review.routes";
import userRoutes from "./modules/user/user.routes"

const app = express();

// IMPORTANTE: express.json() DEBE ir ANTES de las rutas
app.use(express.json());

const PORT = process.env.PORT;

// Registro de rutas
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friendships", friendshipRoutes);

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
