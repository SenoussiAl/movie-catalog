import request from 'supertest';
import { setupTestApp, prisma, clearDatabase } from './testUtils';
import { Express } from 'express';

describe('Movie Controller Tests', () => {
  let app: Express;
  let testMovieId: string;
  const testUserId = '20dddede-13d9-4963-b6ad-acffb41d86b7';

  beforeAll(async () => {
    app = setupTestApp();
    await prisma.$connect();
    await clearDatabase();
    
    // Create test user
    await prisma.user.create({
      data: {
        id: testUserId,
        email: 'testuser@example.com',
        username: 'testuser',
        password: 'testpass'
      }
    });
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  // Test cases go here
});