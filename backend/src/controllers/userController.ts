import { Request, Response } from 'express';
import prisma from '../db';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        email: { include: { email: true } },
        username: { include: { username: true } },
        role: { include: { role: true } },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};