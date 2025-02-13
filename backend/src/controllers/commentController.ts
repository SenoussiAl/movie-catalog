import { Request, Response } from 'express';
import prisma from '../db';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  movieId: z.string().uuid(),
});

export const createComment = async (req: Request, res: Response) => {
  try {
    const { content, movieId } = commentSchema.parse(req.body);
    const userId = req.body.userId;

    const comment = await prisma.comment.create({
      data: {
        content,
        movieId,
        userId
      },
      include: { user: true }
    });

    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: { user: true }
    });
    if (comment.userId !== req.body.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
/*
    if (comment.userId !== req.body.userId && req.body.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
*/
    await prisma.comment.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

export const getCommentsByMovie = async (req: Request, res: Response) => {
  const { movieId } = req.params;
  const { page = '1', limit = '10' } = req.query;

  try {
    const comments = await prisma.comment.findMany({
      where: { movieId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.comment.count({ where: { movieId } });

    res.json({
      data: comments,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};