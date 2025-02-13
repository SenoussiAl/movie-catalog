import { Request, Response } from 'express';
import prisma from '../db';
import { z } from 'zod';

const ratingSchema = z.object({
  score: z.number().min(0.5).max(5).multipleOf(0.5),
  movieId: z.string().uuid(),
});

export const createOrUpdateRating = async (req: Request, res: Response) => {
  try {
    const { score, movieId } = ratingSchema.parse(req.body);
    const userId = req.body.userId; 

    const rating = await prisma.rating.upsert({
      where: {
        movieId_userId: {
          movieId,
          userId
        }
      },
      update: { score },
      create: {
        score,
        movieId,
        userId
      }
    });

    res.json(rating);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update rating' });
  }
};

export const getUserRating = async (req: Request, res: Response) => {
  const { movieId } = req.params;
  const userId = req.body.userId;

  try {
    const rating = await prisma.rating.findUnique({
      where: {
        movieId_userId: {
          movieId,
          userId
        }
      }
    });

    res.json(rating || { score: null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
};

export const getMovieRatings = async (req: Request, res: Response) => {
  const { movieId } = req.params;
  const { page = '1', limit = '10' } = req.query;

  try {
    const ratings = await prisma.rating.findMany({
      where: { movieId },
      include: { user: true },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.rating.count({ where: { movieId } });

    res.json({
      data: ratings,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
};