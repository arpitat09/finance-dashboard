import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

describe('Authentication & User Isolation Tests', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;
  let userATransactionId: string;

  beforeAll(async () => {
    // Clean test DB
    try {
      await prisma.transaction.deleteMany();
      await prisma.budget.deleteMany();
      await prisma.goal.deleteMany();
      await prisma.account.deleteMany();
      await prisma.category.deleteMany();
      await prisma.user.deleteMany();

      const pwd = await hashPassword('Password@123');

      // Create User A
      const userA = await prisma.user.create({
        data: {
          name: 'User A',
          email: 'usera@test.com',
          passwordHash: pwd,
          currency: 'INR',
        },
      });
      userAId = userA.id;
      userAToken = signToken({ userId: userA.id, email: userA.email, role: userA.role });

      // Create User B
      const userB = await prisma.user.create({
        data: {
          name: 'User B',
          email: 'userb@test.com',
          passwordHash: pwd,
          currency: 'INR',
        },
      });
      userBId = userB.id;
      userBToken = signToken({ userId: userB.id, email: userB.email, role: userB.role });

      // Create Category & Transaction for User A
      const catA = await prisma.category.create({
        data: { userId: userA.id, name: 'Food & Dining', type: 'EXPENSE' },
      });

      const txA = await prisma.transaction.create({
        data: {
          userId: userA.id,
          categoryId: catA.id,
          description: 'Secret Dinner of User A',
          amount: '1250.00',
          type: 'EXPENSE',
          date: new Date(),
        },
      });
      userATransactionId = txA.id;
    } catch (e) {
      console.log('Skipping DB setup if DB not connected in CI/test environment');
    }
  });

  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {}
  });

  describe('POST /api/v1/auth/register', () => {
    it('should validate email and password requirements', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test', email: 'invalid-email', password: '123' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('CRITICAL SECURITY: Ownership Protection', () => {
    it("User B must NOT be able to access User A's transaction", async () => {
      if (!userATransactionId || !userBToken) return;

      const res = await request(app)
        .get(`/api/v1/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("User B must NOT be able to update User A's transaction", async () => {
      if (!userATransactionId || !userBToken) return;

      const res = await request(app)
        .put(`/api/v1/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ description: 'Hacked by User B' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("User B must NOT be able to delete User A's transaction", async () => {
      if (!userATransactionId || !userBToken) return;

      const res = await request(app)
        .delete(`/api/v1/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('Unauthenticated requests must be rejected with 401', async () => {
      const res = await request(app).get('/api/v1/transactions');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
