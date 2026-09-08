import { friendshipRepository } from "./friendship.repository";
import { FriendshipStatus } from "./friendship.entity";

export const friendshipService = {
  // UP-045: Enviar solicitud
  async sendRequest(senderId: number, receiverId: number) {
    if (senderId === receiverId) {
      throw new Error("BAD_REQUEST");
    }

    const existingRequest = await friendshipRepository.findBySenderAndReceiver(
      senderId,
      receiverId,
    );
    if (existingRequest) {
      throw new Error("CONFLICT");
    }

    return await friendshipRepository.createRequest(senderId, receiverId);
  },

  // UP-046: Responder solicitud (se mantiene)
  async respondRequest(
    requestId: number,
    userId: number,
    newStatus: FriendshipStatus,
  ) {
    const request = await friendshipRepository.findById(requestId);
    if (!request) {
      throw new Error("NOT_FOUND");
    }
    if (request.receiverId !== userId) {
      throw new Error("FORBIDDEN");
    }
    if (request.status !== "PENDING") {
      throw new Error("CONFLICT");
    }

    return await friendshipRepository.updateStatus(requestId, newStatus);
  },
};
