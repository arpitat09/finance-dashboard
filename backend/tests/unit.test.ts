import { hashPassword, comparePassword } from '../src/utils/password';
import { signToken, verifyToken } from '../src/utils/jwt';
import { toDecimal, formatMoney, roundMoney } from '../src/utils/money';
import {
  registerSchema,
  loginSchema,
  createTransactionSchema,
  createBudgetSchema,
  createGoalSchema,
} from '../src/validators';

describe('Unit Tests — Core Utilities & Validators', () => {
  describe('Password Hashing Utility', () => {
    it('should securely hash password and verify match', async () => {
      const password = 'SuperSecretPassword@2026';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toEqual(password);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Utility', () => {
    it('should sign and verify JWT payload', () => {
      const payload = { userId: 'user-uuid-123', email: 'arpita@finora.app', role: 'USER' };
      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('Financial Money Math & Decimal.js Precision', () => {
    it('should handle decimal addition without standard JS float errors', () => {
      // 0.1 + 0.2 is 0.30000000000000004 in normal JS floats
      const a = toDecimal(0.1);
      const b = toDecimal(0.2);
      const sum = a.plus(b);

      expect(sum.toString()).toBe('0.3');
      expect(roundMoney(sum)).toBe(0.3);
    });

    it('should correctly format INR currency with Indian numbering system', () => {
      const formatted = formatMoney(248520.5, 'INR');
      expect(formatted).toBe('₹2,48,520.50');

      const formattedNegative = formatMoney(-18450.75, 'INR');
      expect(formattedNegative).toBe('-₹18,450.75');
    });

    it('should correctly format USD currency', () => {
      const formatted = formatMoney(12500.5, 'USD');
      expect(formatted).toBe('$12,500.50');
    });
  });

  describe('Zod Validation Schemas', () => {
    it('should accept valid registration input', () => {
      const valid = {
        name: 'Arpita Sharma',
        email: 'arpita@finora.app',
        password: 'ValidPassword123',
        currency: 'INR',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid registration email and short password', () => {
      const invalid = {
        name: 'A',
        email: 'not-an-email',
        password: '123',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate transaction input', () => {
      const validTx = {
        description: 'Supermarket Groceries',
        amount: 3450.5,
        type: 'EXPENSE',
        categoryId: 'cat-123',
        date: '2026-09-02',
      };
      const result = createTransactionSchema.safeParse(validTx);
      expect(result.success).toBe(true);

      const invalidTx = {
        description: '',
        amount: -500,
        type: 'EXPENSE',
        categoryId: '',
        date: 'invalid-date',
      };
      const invalidResult = createTransactionSchema.safeParse(invalidTx);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate budget input', () => {
      const validBudget = {
        name: 'Dining Out',
        categoryId: 'cat-food',
        amount: 10000,
        period: 'MONTHLY',
      };
      expect(createBudgetSchema.safeParse(validBudget).success).toBe(true);
    });

    it('should validate goal input', () => {
      const validGoal = {
        name: 'Emergency Fund',
        targetAmount: 200000,
        currentAmount: 50000,
      };
      expect(createGoalSchema.safeParse(validGoal).success).toBe(true);
    });
  });
});
