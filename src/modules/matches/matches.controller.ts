import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/validate.middleware.js";
import { leaveMatchService } from "./matches.service.js";

export const leaveMatchController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const matchId = req.params.matchId as string;
    const result = await leaveMatchService(matchId, userId);

    return res.status(200).json({
      message: "Has abandonado el partido exitosamente",
      data: result,
    });
  },
);
