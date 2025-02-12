import { Request, Response } from 'express';
import prisma from '../db';
import { z } from 'zod';

const genreSchema = z.object({
  name: z.string().min(1).max(50),
});

export const getAllGenres = async (req: Request, res: Response) => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
};

export const createGenre = async (req: Request, res: Response) => {
  try {
    const { name } = genreSchema.parse(req.body);
    
    const genre = await prisma.genre.create({
      data: { name }
    });

    res.status(201).json(genre);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Genre already exists' });
    }
    res.status(500).json({ error: 'Failed to create genre' });
  }
};

export const updateGenre = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const genre = await prisma.genre.update({
      where: { id: Number(id) },
      data: { name }
    });

    res.json(genre);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Genre already exists' });
    }
    res.status(500).json({ error: 'Failed to update genre' });
  }
};

export const deleteGenre = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const moviesWithGenre = await prisma.genreOnMovie.count({
      where: { genreId: Number(id) }
    });

    if (moviesWithGenre > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete genre assigned to movies' 
      });
    }

    await prisma.genre.delete({
      where: { id: Number(id) }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete genre' });
  }
};