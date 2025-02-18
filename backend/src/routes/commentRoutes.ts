import express from 'express';
import {
  createComment,
  updateComment,
  deleteComment,
  getCommentsByMovie,
} from '../controllers/commentController';

const router = express.Router();

router.post('/', createComment); 
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.get('/movie/:movieId', getCommentsByMovie); 

router.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default router;