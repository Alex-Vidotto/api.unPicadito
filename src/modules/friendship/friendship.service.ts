import { friendshipRepository } from './friendship.repository';
import { FriendshipStatus } from './friendship.entity';

export const friendshipService = {
  async respondRequest(requestId: number, userId: number, newStatus: FriendshipStatus) {
    // 1. Validar si existe el registro
    const request = await friendshipRepository.findById(requestId);
    if (!request) {
      throw new Error('NOT_FOUND');
    }

    // 2. Validar que el usuario sea el destinatario (receiver)
    if (request.receiverId !== userId) {
      throw new Error('FORBIDDEN');
    }

    // 3. Comprobar que esté en estado PENDING
    if (request.status !== 'PENDING') {
      throw new Error('CONFLICT');
    }

    // 4. Actualizar estado
    return await friendshipRepository.updateStatus(requestId, newStatus);
  }
};