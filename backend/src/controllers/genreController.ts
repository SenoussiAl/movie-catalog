import { Request, Response } from 'express';
import prisma from '../db';
import { z } from 'zod';

const genreSchema = z.object({
  name: z.string().min(1).max(50),
});

export const getGenres = async (req: Request, res: Response): Promise<void> => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
};

export const createGenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = genreSchema.parse(req.body);
    
    const genre = await prisma.genre.create({
      data: { name }
    });

    res.status(201).json(genre);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    if ((error as any).code === 'P2002') {
      res.status(409).json({ error: 'Genre already exists' });
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
    res.status(500).json({ error: 'Failed to update genre' });
    }
};

export const deleteGenre = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const genreId = Number(id);

    // Check if the genre exists
    const genre = await prisma.genre.findUnique({
      where: { id: genreId }
    });

    if (!genre) {
      res.status(404).json({ error: 'Genre not found' });
      return; // Use return to exit the function
    }

    // Check if the genre is assigned to any movies
    const moviesWithGenre = await prisma.genreOnMovie.count({
      where: { genreId }
    });

    if (moviesWithGenre > 0) {
      res.status(400).json({ 
        error: 'Cannot delete genre assigned to movies' 
      });
      return; // Use return to exit the function
    }

    // Delete the genre
    await prisma.genre.delete({
      where: { id: genreId }
    });

    res.status(204).send(); // Send a response without a body
  } catch (error) {
    console.error('Error deleting genre:', error);
    res.status(500).json({ 
      error: 'Failed to delete genre',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};