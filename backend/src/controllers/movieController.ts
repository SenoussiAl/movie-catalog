import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class MovieController {
  async getMovies(req: Request, res: Response): Promise<void> {
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

  async getMovieById(req: Request, res: Response): Promise<void> {
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
  
}

export default new MovieController();