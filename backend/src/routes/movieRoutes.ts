import express from 'express';
import { getMovies, createMovie } from '../controllers/movieController';

const router = express.Router();

router.get('/', getMovies);
router.post('/', createMovie);

export default router;