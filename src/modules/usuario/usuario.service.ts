import { buscarJugadores } from './usuario.repository.js';

export const buscarjugadores = async (nombre?: string) => {
  const nombreLimpio = nombre?.trim();

  
  if (nombreLimpio && nombreLimpio.length < 2) {
    throw new Error("El término de búsqueda debe tener al menos 2 caracteres.");
  }

  const filtros = {
    nombre: nombreLimpio
  };

  return await buscarJugadores(filtros);
};