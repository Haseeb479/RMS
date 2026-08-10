import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT || 5000),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret',
  NODE_ENV: process.env.NODE_ENV || 'development',
};