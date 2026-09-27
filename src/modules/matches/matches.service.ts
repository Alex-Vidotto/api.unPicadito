import { AppDataSource } from "../../database/data-source";
import { ParticipacionSala } from "./../participacionSala/participacionSala.entity";
import { Sala } from "./../sala/sala.entity";

export const leaveMatchService = async (matchId: string, userId: number) => {
  const participacionRepository =
    AppDataSource.getRepository(ParticipacionSala);
  const salaRepository = AppDataSource.getRepository(Sala);

  const participation = await participacionRepository.findOne({
    where: {
      sala: { id: matchId },
      usuario: { id: userId },
    },
  });

  if (!participation) {
    throw new Error("No estás registrado en esta sala o la sala no existe");
  }

  await participacionRepository.remove(participation);

  const remainingParticipants = await participacionRepository.count({
    where: {
      sala: { id: matchId },
    },
  });

  if (remainingParticipants === 0) {
    const salaAEliminar = await salaRepository.findOne({
      where: { id: matchId },
    });
    if (salaAEliminar) {
      await salaRepository.remove(salaAEliminar);
    }
  }

  return { matchId, userId, salaEliminada: remainingParticipants === 0 };
};
