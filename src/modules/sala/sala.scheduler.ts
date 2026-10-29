import { finalizarSalasVencidasService } from "./sala.service";

const INTERVALO_BARRIDO_MS = 60_000;
let barridoEnCurso = false;

const ejecutarBarrido = async (): Promise<void> => {
    if (barridoEnCurso) return;
    barridoEnCurso = true;

    try {
        const finalizadas = await finalizarSalasVencidasService();
        if (finalizadas > 0) {
            console.log(`[scheduler] Salas finalizadas automáticamente: ${finalizadas}`);
        }
    } catch (error) {
        console.error("[scheduler] Error al finalizar salas vencidas:", error);
    } finally {
        barridoEnCurso = false;
    }
};

export const iniciarSchedulerSalas = () => {
    void ejecutarBarrido();
    return setInterval(ejecutarBarrido, INTERVALO_BARRIDO_MS).unref();
};