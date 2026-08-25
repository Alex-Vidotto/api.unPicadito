export type PosicionCancha =
    | 'ARQUERO'
    | 'DEFENSOR'
    | 'MEDIOCAMPISTA'
    | 'DELANTERO'
    | 'TODOTERRENO';

export type EstadoAmistad =
    | 'PENDIENTE'
    | 'ACEPTADA'
    | 'RECHAZADA';

export type EstadoSala =
    | 'ABIERTA'
    | 'COMPLETA'
    | 'FINALIZADA'
    | 'CANCELADA';

export type RolEnSala =
    | 'ORGANIZADOR'
    | 'TITULAR'
    | 'SUPLENTE'
    | 'SOLICITANTE';

export type EstadoParticipacion =
    | 'PENDIENTE'
    | 'CONFIRMADO'
    | 'RECHAZADO'
    | 'BAJA'
    | 'EXPULSADO';

export type OrigenIngreso = 'ENLACE_INVITACION' | 'SOLICITUD_DIRECTA';