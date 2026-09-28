import { AppDataSource } from "../../database/data-source";
import { ParticipacionSala } from "./../participacionSala/participacionSala.entity";
import { Sala } from "./../sala/sala.entity";

export const leaveMatchService = async (matchId: string, userId: number) => {
  const participacionRepository =
    AppDataSource.getRepository(ParticipacionSala);
  const salaRepository = AppDataSource.getRepository(Sala);

  const sala = await salaRepository.findOne({ where: { id: matchId } });
  if (!sala) {
    throw new Error("Sala no encontrada");
  }

  const matchDateTime = new Date(sala.fechaHoraPartido);
  const now = new Date();
  const hoursDifference =
    (matchDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursDifference < 24) {
    throw new Error(
      "No puedes cancelar tu participación con menos de 24 hs de anticipación",
    );
  }

  const participation = await participacionRepository.findOne({
    where: {
      sala: { id: matchId },
      usuario: { id: userId },
    },
  });

  if (!participation) {
    throw new Error("No estás registrado en esta sala");
  }

  await participacionRepository.remove(participation);

  const remainingParticipants = await participacionRepository.count({
    where: {
      sala: { id: matchId },
    },
  });

  if (remainingParticipants === 0) {
    await salaRepository.remove(sala);
  }

  return {
    matchId,
    userId,
    salaEliminada: remainingParticipants === 0,
    message: "Participación cancelada exitosamente",
  };
};
