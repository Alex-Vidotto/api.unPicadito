import express from "express";
import { AppDataSource } from "./database/data-source";
import reviewRoutes from "./modules/review/review.routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Enrutadores
app.use("/api/reviews", reviewRoutes);


AppDataSource.initialize()
    .then(() => {
        console.log("Conexión con la Base de Datos con éxito");
        
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error durante la inicialización de la Base de Datos:", error);
    });
