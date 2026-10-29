import { friendshipRepository } from "./friendship.repository";
import { FriendshipStatus, FRIENDSHIP_STATUS } from "../../constants/type";

const errorHttp = (status: number, mensaje: string) => Object.assign(new Error(mensaje), { status });

export const sendRequest = async (senderId: number, receiverId: number) => {
  if (senderId === receiverId) {
    throw errorHttp(400, "No puedes enviarte una solicitud a ti mismo");
  }

  const existingRequest = await friendshipRepository.findBySenderAndReceiver(senderId, receiverId);
  if (existingRequest) {
    throw errorHttp(409, "Ya existe una solicitud activa entre ambos usuarios");
  }

  return await friendshipRepository.createRequest(senderId, receiverId);
};

export const respondRequest = async (
  requestId: number,
  userId: number,
  newStatus: FriendshipStatus
) => {
  const request = await friendshipRepository.findById(requestId);
  if (!request) {
    throw errorHttp(404, "La solicitud no existe");
  }
  if (request.receiverId !== userId) {
    throw errorHttp(403, "No eres el destinatario de esta solicitud");
  }
  if (request.status !== FRIENDSHIP_STATUS.PENDING) {
    throw errorHttp(409, "La solicitud ya fue respondida");
  }

  return await friendshipRepository.updateStatus(requestId, newStatus);
};

export const friendshipService = {
  sendRequest,
  respondRequest,
};
