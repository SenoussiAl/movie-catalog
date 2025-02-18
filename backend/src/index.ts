import express from 'express';
import movieRoutes from './routes/movieRoutes';
import userRoutes from './routes/usersRoutes';
import ratingsRoutes from './routes/ratingRoutes';
import commentsRoutes from './routes/commentRoutes';
import genreRoutes from './routes/genreRoutes';
import directorRoutes from './routes/directorRoutes';
import actorRoutes from './routes/actorRoutes';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use('/movies', movieRoutes);
app.use('/users', userRoutes);
app.use('/director', directorRoutes);
app.use('/genre', genreRoutes);
app.use('/ratings', ratingsRoutes);
app.use('/comments', commentsRoutes);
app.use('/actors', actorRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();