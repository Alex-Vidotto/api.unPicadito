import { Router } from 'express';
import { createReview, getAverageRating } from './review.repository';

const router = Router();

// Ruta POST: http://localhost:3000/api/reviews
// Sirve para probar la inserción en la base de datos
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        
      
        const nuevaResena = await createReview(data);
        
        res.status(201).json({
            ok: true,
            message: "Reseña guardada exitosamente en MySQL",
            data: nuevaResena
        });
    } catch (error: any) {
        res.status(500).json({
            ok: false,
            message: "Error al guardar la reseña en la base de datos",
            error: error.message
        });
    }
});

// GET: http://localhost:3000/api/reviews/ranking/:id
// Sirve para probar el QueryBuilder del promedio matemático
router.get('/ranking/:id', async (req, res) => {
    try {
        const calificadoId = req.params.id;
        
        //  función de agregación SQL (AVG y COUNT)
        const ranking = await getAverageRating(Number(calificadoId));
        
        res.status(200).json({
            ok: true,
            calificadoId,
            ranking
        });
    } catch (error: any) {
        res.status(500).json({
            ok: false,
            message: "Error al calcular el promedio",
            error: error.message
        });
    }
});

export default router;
