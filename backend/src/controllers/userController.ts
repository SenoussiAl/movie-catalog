import { Request, Response } from 'express';
import prisma from '../db';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        profile: true,
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        ratings: true,
        comments: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { email, username, password, role, bio, avatarUrl } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password,
        role,
        profile: {
          create: {
            bio,
            avatarUrl,
          },
        },
      },
      include: {
        profile: true,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, username, password, role, bio, avatarUrl } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        username,
        password,
        role,
        profile: {
          update: {
            bio,
            avatarUrl,
          },
        },
      },
      include: {
        profile: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};