import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import express from "express";
import cors from 'cors'; 
import reviewRoutes from "./modules/review/review.routes";
import userRoutes from "./modules/user/user.routes";
import { AppDataSource } from "./database/data-source";

const app = express();

app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.use("/api/reviews", reviewRoutes); 
app.use("/api/users", userRoutes);


AppDataSource.initialize()
    .then(() => {
        console.log("Base de datos conectada");
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch((err: Error) => {
        console.error("Error al conectar:", err);
        process.exit(1);
    });
