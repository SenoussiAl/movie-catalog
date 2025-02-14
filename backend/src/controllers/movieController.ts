import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMovies = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      
      const validSortFields = ['title', 'releaseDate'];
      const sortBy = typeof req.query.sortBy === 'string' && validSortFields.includes(req.query.sortBy)
        ? req.query.sortBy
        : 'title';
      const sortOrder = typeof req.query.sortOrder === 'string' && req.query.sortOrder === 'desc' 
        ? 'desc' 
        : 'asc';
  
      const skip = (page - 1) * limit;
      const movies = await prisma.movie.findMany({
        skip,
        take: limit,
        orderBy: { 
          [sortBy]: sortOrder
        },
        select: {
          id: true,
          title: true,
          releaseDate: true,
          duration: true,
          posterUrl: true,
          description: true,
        },
      });
  
      res.json({
        data: movies,
        meta: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: await prisma.movie.count(),
        }
      });
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  export const getMovieById = async(req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const movie = await prisma.movie.findUnique({
        where: { id },
        include: {
          genres: { include: { genre: true } },
          actors: { include: { actor: true } },
          directors: { include: { director: true } },
          comments: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!movie) {
        res.status(404).json({ error: 'Movie not found' });
        return;
      }
      const [userRatings, criticRatings] = await Promise.all([
        prisma.rating.aggregate({
          where: {
            movieId: id,
            user: { role: 'USER' },
          },
          _avg: { score: true },
        }),
        prisma.rating.aggregate({
          where: {
            movieId: id,
            user: { role: 'CRITIC' },
          },
          _avg: { score: true },
        }),
      ]);
      const response = {
        ...movie,
        genres: movie.genres.map(g => g.genre.name),
        actors: movie.actors.map(a => ({
          id: a.actor.id,
          name: a.actor.name,
          role: a.role,
          bio: a.actor.bio,
          dateOfBirth: a.actor.dateOfBirth,
        })),
        directors: movie.directors.map(d => ({
          id: d.director.id,
          name: d.director.name,
          bio: d.director.bio,
          dateOfBirth: d.director.dateOfBirth,
        })),
        comments: movie.comments.map(c => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          user: {
            username: c.user.username,
            avatar: c.user.profile?.avatarUrl,
          },
        })),
        ratings: {
          users: userRatings._avg.score,
          critics: criticRatings._avg.score,
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching movie:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
 
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
