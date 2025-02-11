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
export const getMovieById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: true } },
        actors: { include: { actor: true } },
        directors: { include: { director: true } },
        ratings: true,
        comments: true,
      },
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie' });
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

export const updateMovie = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, releaseDate, duration, posterUrl, trailerUrl, genres, actors, directors } = req.body;
  try {
    await prisma.genreOnMovie.deleteMany({ where: { movieId: id } });
    await prisma.actorOnMovie.deleteMany({ where: { movieId: id } });
    await prisma.directorOnMovie.deleteMany({ where: { movieId: id } });

    const movie = await prisma.movie.update({
      where: { id },
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
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update movie' });
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.movie.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
};