import express from 'express';
import {
  getDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector,
} from '../controllers/directorController';

const router = express.Router();

router.get('/', getDirectors);
router.get('/:id', getDirectorById);
router.post('/', createDirector);
router.put('/:id', updateDirector);
router.delete('/:id', deleteDirector);

router.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default router;