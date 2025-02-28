import express from 'express';
import {
  getActors,
  getActorById,
  createActor,
  updateActor,
  deleteActor,
} from '../controllers/actorController';

const router = express.Router();

router.get('/', getActors);
router.get('/:id', getActorById);
router.post('/', createActor); 
router.put('/:id', updateActor);
router.delete('/:id', deleteActor); 

router.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default router;