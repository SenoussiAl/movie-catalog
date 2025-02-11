import { Request, Response } from 'express';
import prisma from '../db';

export const getDirectors = async (req: Request, res: Response) => {
  try {
    const directors = await prisma.director.findMany({
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });
    res.json(directors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch directors' });
  }
};

export const getDirectorById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const director = await prisma.director.findUnique({
      where: { id },
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });

    if (!director) {
      return res.status(404).json({ error: 'Director not found' });
    }

    res.json(director);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch director' });
  }
};

export const createDirector = async (req: Request, res: Response) => {
  const { name, bio, dateOfBirth } = req.body;
  try {
    const director = await prisma.director.create({
      data: {
        name,
        bio,
        dateOfBirth: new Date(dateOfBirth),
      },
    });
    res.status(201).json(director);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create director' });
  }
};

export const updateDirector = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, bio, dateOfBirth } = req.body;
  try {
    const director = await prisma.director.update({
      where: { id },
      data: {
        name,
        bio,
        dateOfBirth: new Date(dateOfBirth),
      },
    });
    res.json(director);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update director' });
  }
};

export const deleteDirector = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.director.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete director' });
  }
};