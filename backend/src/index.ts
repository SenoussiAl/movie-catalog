import express from 'express';
import movieRoutes from './routes/movieRoutes';
import prisma from './db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/movies', movieRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});