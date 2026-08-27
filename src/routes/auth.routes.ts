import { Router } from 'express';
import { 
    register, 
    login, 
    getProfile,
    updateProfile
} from '../controllers/auth.controller';

const router = Router();

//rutas de autentikeishon
router.post('/register', register);
router.post('/login', login);

//rutas para los perfiles
router.get('/profile', getProfile);
router.put('/profile', updateProfile)


export default router;
