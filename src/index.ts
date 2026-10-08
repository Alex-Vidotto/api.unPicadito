import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from 'cors';
import http from "http";
import { Server } from "socket.io";
import reviewRoutes from "./modules/review/review.routes";
import userRoutes from "./modules/user/user.routes";
import friendshipRoutes from "./modules/friendship/friendship.routes";
import salaRoutes from "./modules/sala/sala.routes";
import messageRoutes from "./modules/messages/message.routes";
import { initMessageSocket } from "./modules/messages/message.socket";
import { AppDataSource } from "./database/data-source";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Registro de rutas
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friendships", friendshipRoutes);
app.use("/api/salas", salaRoutes);
app.use("/api/messages", messageRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error capturado:", err.message);
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || "Error interno del servidor",
    });
});

//configuracion del servidor y socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "htttp://localhost:5173",
        methods: ["GET", "POST"],
    },
});

// Inicializar el socket de mensajes con la instancia de "io"
initMessageSocket(io);

AppDataSource.initialize()
  .then(() => {
    console.log("Base de datos conectada");
    server.listen(process.env.PORT || 8080, () => {
      console.log(`Servidor en puerto ${process.env.PORT || 8080}`);
    });
  })
  .catch((err: Error) => {
    console.error("Error al conectar:", err);
    process.exit(1);
  });
