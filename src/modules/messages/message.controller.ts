import { Request, Response, NextFunction } from "express";
import { MessageService } from "./message.service";

export class MessageController {
    private messageService = new MessageService();

    // crear un mensaje desde HTTP
    createMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { senderId, receiverId, content } = req.body;

            if (!Number.isInteger(senderId) || senderId <= 0 ||
                !Number.isInteger(receiverId) || receiverId <= 0 ||
                typeof content !== "string" || !content.trim()) {
                res.status(400).json({
                    success: false,
                    message: "senderId y receiverId deben ser IDs enteros positivos y content no puede estar vacío.",
                });
                return;
            }

            const message = await this.messageService.createMessage(
                senderId,
                receiverId,
                content.trim(),
            );

            res.status(201).json({ success: true, data: message });
        } catch (error) {
            next(error);
        }
    };

    // obtener el historial de chat entre dos usuarios
    getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try{
            const user1 = parseInt(String(req.params.user1));
            const user2 = parseInt(String(req.params.user2));

            const history = await this.messageService.getChatHistory(user1, user2);

            res.json({ success: true, data: history });
        } catch (error) {
            next(error);
        }

    };
}