import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes"; // Importación de rutas
import { AppDataSource } from "./database/data-source"; 
 
dotenv.config();

const app = express();

// 💡 REGLA DE ORO DE EXPRESS: Configurar los parsers e intermediarios primero
app.use(express.json()); // 1. Lector de JSON obligatorio primero

app.use(cors({            // 2. Control de seguridad CORS segundo
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

// 🚀 CONECTAR LAS RUTAS AQUÍ (Después de que express.json() ya preparó los datos)
app.use('/api/auth', authRoutes);

// ... código anterior

app.use('/api/auth', authRoutes);

// 👇 Agregamos las rutas directas que faltaban para poblar el Home
import { getPartidos, getActividades, getSugerencias } from "./controllers/auth.controller";
app.get('/api/partidos', getPartidos);
app.get('/api/actividades', getActividades);
app.get('/api/conexiones/sugeridas', getSugerencias);

// Inicializacion BD

AppDataSource.initialize()
    .then(() => {
        console.log("Base de datos conectada");
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Servidor en puerto ${process.env.PORT || 3000}`);
        });
    })
    .catch((err: Error) => {
        console.error("Error al conectar:", err);
        process.exit(1);
    });

    