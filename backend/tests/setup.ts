import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_jwt_key_finora';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test_user:test_pwd@localhost:5432/finora_test?schema=public';
}
