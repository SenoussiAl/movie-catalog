import express from 'express';
import MovieController from '../controllers/movieController';

const router = express.Router();

router.get('/movies', MovieController.getMovies);
router.get('/movies/:id', MovieController.getMovieById);

export default router;