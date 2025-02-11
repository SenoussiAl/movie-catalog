import { Request, Response } from 'express';
import prisma from '../db';

export const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        genres: { include: { genre: true } },
        actors: { include: { actor: true } },
        directors: { include: { director: true } },
      },
    });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

export const createMovie = async (req: Request, res: Response) => {
  const { title, description, releaseDate, duration, posterUrl, trailerUrl, genres, actors, directors } = req.body;
  try {
    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        releaseDate: new Date(releaseDate),
        duration,
        posterUrl,
        trailerUrl,
        genres: {
          create: genres.map((genreId: number) => ({
            genre: { connect: { id: genreId } },
          })),
        },
        actors: {
          create: actors.map((actorId: string) => ({
            actor: { connect: { id: actorId } },
          })),
        },
        directors: {
          create: directors.map((directorId: string) => ({
            director: { connect: { id: directorId } },
          })),
        },
      },
    });
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create movie' });
  }
};