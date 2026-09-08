import { AppDataSource } from '../../database/data-source';
import { FriendshipEntity, FriendshipStatus } from './friendship.entity';

const repo = AppDataSource.getRepository(FriendshipEntity);

export const friendshipRepository = {
  // Buscar por ID de la solicitud
  async findById(id: number) {
    return await repo.findOne({ where: { id } });
  },

  // Buscar si ya existe solicitud entre dos usuarios
  async findBySenderAndReceiver(senderId: number, receiverId: number) {
    return await repo.findOne({
      where: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });
  },

  // Actualizar estado (ACCEPTED o REJECTED)
  async updateStatus(id: number, status: FriendshipStatus) {
    await repo.update(id, { status });
    return await repo.findOne({ where: { id } });
  }
};