import { z } from "zod";
import { AppDataSource } from "../database/data-source";
import { FriendRequest } from "../entities/FriendRequest";
import { User } from "../entities/User";
const paramSchema = z.object({
    userId: z.string().uuid(),
});
export const sendFriendRequest = async (req, res) => {
    try {
        const { userId: receiverId } = paramSchema.parse(req.params);
        const senderId = req.user.id;
        if (senderId === receiverId) {
            return res.status(400).json({
                message: "No puedes enviarte una solicitud de amistad a ti mismo.",
            });
        }
        const userRepository = AppDataSource.getRepository(User);
        const friendRequestRepository = AppDataSource.getRepository(FriendRequest);
        const receiverExists = await userRepository.findOne({
            where: { id: receiverId },
        });
        if (!receiverExists) {
            return res.status(404).json({
                message: "El usuario destino no existe.",
            });
        }
        const existingRequest = await friendRequestRepository.findOne({
            where: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        });
        if (existingRequest) {
            return res.status(400).json({
                message: "Ya existe una solicitud pendiente o una relación de amistad entre ambos.",
            });
        }
        const newRequest = friendRequestRepository.create({
            senderId,
            receiverId,
            status: "PENDING",
        });
        await friendRequestRepository.save(newRequest);
        return res.status(201).json({
            message: "Solicitud de amistad enviada con éxito.",
            data: newRequest,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res
                .status(400)
                .json({ message: "Datos inválidos.", errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({
            message: "Error interno del servidor al procesar la solicitud.",
        });
    }
};
