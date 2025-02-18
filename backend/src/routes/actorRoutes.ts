import express from 'express';
import {
  getActors,
  getActorById,
  createActor,
  updateActor,
  deleteActor
} from '../controllers/actorController';

const router = express.Router();

router.get('/actors', getActors);
router.get('/actors/:id', getActorById);
router.post('/actors', createActor);
router.put('/actors/:id', updateActor);
router.delete('/actors/:id', deleteActor);

router.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default router;