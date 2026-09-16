import * as yup from "yup";

export const crearSalaSchema = yup.object({
    nombre: yup.string().required("El nombre de la sala es requerido").max(30),
    descripcion: yup.string().nullable().max(250),
    nombreCancha: yup.string().required().max(30),
    direccion: yup.string().required().max(100),
    fechaHoraPartido: yup.date().min(new Date(), "Fecha actual o futura").required(),
    cuposTotales: yup.number().integer().min(10).default(10),
    permiteSumplentes: yup.boolean().default(true),
    cuposSumplentesMax: yup.number().integer().default(4).max(20),
    esPublica: yup.boolean().default(true),
    ubicacion: yup.object({
        x: yup.number().required(),
        y: yup.number().required()
    }).required()
});