import { Server, Socket } from "socket.io";
import { MessageService } from "./message.service";

const activeUsers = new Map<number, string>();
const messageService = new MessageService();

// Función para inicializar el socket de mensajes
export const initMessageSocket = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log(`🔌 Cliente conectado al chat: ${socket.id}`);

        socket.on("user_register", (userId: number) => {
            activeUsers.set(userId, socket.id);
            console.log(`Usuario registrado: ${userId} con socket ID: ${socket.id}`);
        });

        socket.on("send_message", async (data: { senderId: number; receiverId: number; content: string }) => {
            const { senderId, receiverId, content } = data;

            try {
                // Guardar usando el servicio
                const newMessage = await messageService.createMessage(senderId, receiverId, content);

                //reenviar el mensaje al receptor si está conectado
                const receiverSocketId = activeUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receive_message", newMessage);
                }

                //confirmar al emisor que el mensaje fue enviado
                socket.emit("message_sent", newMessage);
            } catch (error) {
                console.error("Error al enviar el mensaje:", error);
                socket.emit("error_message", { message: "Error al enviar el mensaje" });
            }
        });

        //limpiar al desconectarse
        socket.on("disconnect", () => {
            for (const [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    activeUsers.delete(userId);
                    console.log(`Usuario ${userId} desconectado`);
                    break;
                }
            }
        });
    });
}
