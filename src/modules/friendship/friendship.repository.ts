import { AppDataSource } from "../../database/data-source";
import { FriendshipEntity } from "./friendship.entity";
import { FriendshipStatus, FRIENDSHIP_STATUS } from "../../constants/type";

const repo = () => AppDataSource.getRepository(FriendshipEntity);

export const findById = async (id: number) => {
    return await repo().findOne({ where: { id } });
};

export const findBySenderAndReceiver = async (senderId: number, receiverId: number) => {
    return await repo().findOne({
        where: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
        ]
    });
};

export const createRequest = async (senderId: number, receiverId: number) => {
    const nuevaSolicitud = repo().create({
        senderId,
        receiverId,
        status: FRIENDSHIP_STATUS.PENDING,
    });
    return await repo().save(nuevaSolicitud);
};

export const updateStatus = async (id: number, status: FriendshipStatus) => {
    await repo().update(id, { status });
    return await repo().findOne({ where: { id } });
};

export const friendshipRepository = {
    findById,
    findBySenderAndReceiver,
    createRequest,
    updateStatus,
};
