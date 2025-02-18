import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import movieRoutes from '../src/routes/movieRoutes';

export const setupTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/movies', movieRoutes);
  return app;
};

export const prisma = new PrismaClient();

export const clearDatabase = async () => {
  const deleteOrder = [
    'Rating',
    'Comment',
    'GenreOnMovie',
    'ActorOnMovie',
    'DirectorOnMovie',
    'Movie',
    'Genre',
    'Actor',
    'Director',
    'Profile',
    'User'
  ];

  for (const model of deleteOrder) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${model}" CASCADE;`);
  }
};