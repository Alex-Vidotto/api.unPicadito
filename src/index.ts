import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Configurar variables de entorno (.env)
dotenv.config();

const app = express();

// Middlewares fundamentales
app.use(cors()); // Permite que tu frontend (React) se conecte sin problemas de CORS
app.use(express.json()); // Permite que Express entienda el formato JSON que envía React

// Ruta de prueba para saber si el backend responde en el navegador
app.get("/", (req, res) => {
  res.send("¡El backend de unPicadito está funcionando perfectamente!");
});

// Aquí irán tus rutas reales más adelante, por ejemplo:
// import authRoutes from "./routes/auth.routes";
// app.use("/api/auth", authRoutes);

// Definir el puerto (usará el del archivo .env o el 3000 por defecto)
const PORT = process.env.PORT || 3000;

// Iniciar el servidor de Express
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`=========================================`);
});
