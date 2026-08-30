import { AmistadRepository } from "./amistad.repository";

export class AmistadService {
  async respondToRequest(
    requestId: number,
    userId: string,
    status: "ACCEPTED" | "REJECTED",
  ) {
    const friendRequest = await AmistadRepository.findOne({
      where: { id: requestId },
      relations: ["destinatario"],
    });

    if (!friendRequest) {
      throw new Error("NOT_FOUND");
    }

    if (friendRequest.destinatario.id !== userId) {
      throw new Error("FORBIDDEN");
    }

    if (friendRequest.estado !== "PENDIENTE") {
      throw new Error("ALREADY_PROCESSED");
    }

    friendRequest.estado =
      status === "ACCEPTED" ? ("ACEPTADA" as any) : ("RECHAZADA" as any);

    return await AmistadRepository.save(friendRequest);
  }
}
