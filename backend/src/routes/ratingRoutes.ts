import express from 'express';
import {
  createOrUpdateRating,
  getUserRating,
  getMovieRatings,
} from '../controllers/ratingController';

const router = express.Router();

router.post('/', createOrUpdateRating);
router.get('/:movieId', getUserRating);
router.get('/movie/:movieId', getMovieRatings);

router.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default router;