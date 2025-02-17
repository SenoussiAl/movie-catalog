import { Request, Response } from 'express';
import prisma from '../db';

export const getActors = async (req: Request, res: Response): Promise<void> => {
  try {
    const actors = await prisma.actor.findMany({
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });
    res.json(actors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch actors' });
  }
};

export const getActorById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const actor = await prisma.actor.findUnique({
      where: { id },
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });

    if (!actor) {
      res.status(404).json({ error: 'Actor not found' });
      return;
    }

    res.json(actor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch actor' });
  }
};

export const createActor = async (req: Request, res: Response) => {
  const { name, bio, dateOfBirth } = req.body;
  try {
    const actor = await prisma.actor.create({
      data: {
        name,
        bio,
        dateOfBirth: new Date(dateOfBirth),
      },
    });
    res.status(201).json(actor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create actor' });
  }
};

export const updateActor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, bio, dateOfBirth } = req.body;
  try {
    const actor = await prisma.actor.update({
      where: { id },
      data: {
        name,
        bio,
        dateOfBirth: new Date(dateOfBirth),
      },
    });
    res.json(actor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update actor' });
  }
};

export const deleteActor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.actor.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete actor' });
  }
};