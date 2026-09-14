import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos la interfaz Request de Express para reconozca req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no provisto o formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Reemplaza 'TU_CLAVE_SECRETA' por process.env.JWT_SECRET o tu clave actual
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'TU_CLAVE_SECRETA') as { id: number };
    
    // Inyectamos el usuario en la request
    req.user = { id: decoded.id };
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};