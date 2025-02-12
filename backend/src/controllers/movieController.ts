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

export const searchMovies = async (req: Request, res: Response) => {
  try {
    const {
      title,
      genre,
      minRating,
      actor,
      director,
      year,
      page = '1',
      limit = '10',
    } = req.query;

    const where: any = {};

    if (title) {
      where.title = {
        contains: title as string,
        mode: 'insensitive',
      };
    }

    if (genre) {
      where.genres = {
        some: {
          genre: {
            name: {
              equals: genre as string,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    if (actor) {
      where.actors = {
        some: {
          actor: {
            name: {
              contains: actor as string,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    if (director) {
      where.directors = {
        some: {
          director: {
            name: {
              contains: director as string,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    if (year) {
      where.releaseDate = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }

    const query = {
      where,
      include: {
        genres: { include: { genre: true } },
        actors: { include: { actor: true } },
        directors: { include: { director: true } },
        ratings: true,
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    };

    const movies = await prisma.movie.findMany(query);

    const processedMovies = movies.map(movie => {
      const totalRatings = movie.ratings.reduce((sum, rating) => sum + rating.score, 0);
      const avgRating = movie.ratings.length > 0 
        ? totalRatings / movie.ratings.length 
        : 0;
      
      return {
        ...movie,
        avgRating,
      };
    });

    const filteredMovies = minRating 
      ? processedMovies.filter(movie => movie.avgRating >= Number(minRating))
      : processedMovies;

    const total = await prisma.movie.count({ where });

    res.json({
      data: filteredMovies,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
};
