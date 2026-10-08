import { AppDataSource } from "../../database/data-source.js";
import { Message } from "./message.entity.js";

export class MessageService {
    private messageRepository = AppDataSource.getRepository(Message);

    //guardar un mensaje enviado
    async createMessage(senderId: number, receiverId: number, content: string): Promise<Message> {
        const newMessage = this.messageRepository.create({ senderId, receiverId, content});
        return await this.messageRepository.save(newMessage);
    }

    //trae losmensajes entre los usuarios}
    async getChatHistory(userId1: number, userId2: number): Promise<Message[]> {
        return await this.messageRepository.find({
            where: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ],
            order: { createdAt: "ASC" }
        });
    }
}