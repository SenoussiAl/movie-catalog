import express from 'express';
import {
  createGenre,
  updateGenre,
  deleteGenre,
  getGenres,
} from '../controllers/genreController';

const router = express.Router();

router.post('/', createGenre); 
router.put('/:id', updateGenre);
router.delete('/:id', deleteGenre);
router.get('/movie/:movieId', getGenres); 

router.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default router;