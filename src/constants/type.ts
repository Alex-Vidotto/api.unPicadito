export const POSICION_CANCHA = {
    ARQUERO: 'ARQUERO',
    DEFENSOR: 'DEFENSOR',
    MEDIOCAMPISTA: 'MEDIOCAMPISTA',
    DELANTERO: 'DELANTERO',
    TODOTERRENO: 'TODOTERRENO',
    POLIFUNCIONAL: 'POLIFUNCIONAL',
} as const;
export type PosicionCancha = typeof POSICION_CANCHA[keyof typeof POSICION_CANCHA];

export const ESTADO_AMISTAD = {
    PENDIENTE: 'PENDIENTE',
    ACEPTADA: 'ACEPTADA',
    RECHAZADA: 'RECHAZADA',
} as const;
export type EstadoAmistad = typeof ESTADO_AMISTAD[keyof typeof ESTADO_AMISTAD];

export const FRIENDSHIP_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
} as const;
export type FriendshipStatus = typeof FRIENDSHIP_STATUS[keyof typeof FRIENDSHIP_STATUS];

export const ESTADO_SALA = {
    ABIERTA: 'ABIERTA',
    COMPLETA: 'COMPLETA',
    FINALIZADA: 'FINALIZADA',
    CANCELADA: 'CANCELADA',
} as const;
export type EstadoSala = typeof ESTADO_SALA[keyof typeof ESTADO_SALA];

export const ROL_EN_SALA = {
    ORGANIZADOR: 'ORGANIZADOR',
    TITULAR: 'TITULAR',
    SUPLENTE: 'SUPLENTE',
    SOLICITANTE: 'SOLICITANTE',
} as const;
export type RolEnSala = typeof ROL_EN_SALA[keyof typeof ROL_EN_SALA];

export const ESTADO_PARTICIPACION = {
    PENDIENTE: 'PENDIENTE',
    CONFIRMADO: 'CONFIRMADO',
    RECHAZADO: 'RECHAZADO',
    BAJA: 'BAJA',
    EXPULSADO: 'EXPULSADO',
} as const;
export type EstadoParticipacion = typeof ESTADO_PARTICIPACION[keyof typeof ESTADO_PARTICIPACION];

export const ORIGEN_INGRESO = {
    ENLACE_INVITACION: 'ENLACE_INVITACION',
    SOLICITUD_DIRECTA: 'SOLICITUD_DIRECTA',
} as const;
export type OrigenIngreso = typeof ORIGEN_INGRESO[keyof typeof ORIGEN_INGRESO];

export const TIPO_FUTBOL = {
    FUTBOL_5: 'FUTBOL_5',
    FUTBOL_7: 'FUTBOL_7',
    FUTBOL_8: 'FUTBOL_8',
    FUTBOL_11: 'FUTBOL_11',
} as const;
export type TipoFutbol = typeof TIPO_FUTBOL[keyof typeof TIPO_FUTBOL];

export const TIPO_SUPERFICIE = {
    SINTETICO: 'SINTETICO',
    CESPED_NATURAL: 'CESPED_NATURAL',
    PARQUET: 'PARQUET',
} as const;
export type TipoSuperficie = typeof TIPO_SUPERFICIE[keyof typeof TIPO_SUPERFICIE];
