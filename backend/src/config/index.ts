import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret_last_mile_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  emailApiKey: process.env.EMAIL_API_KEY || 'mock_key',
  emailFrom: process.env.EMAIL_FROM || 'notifications@lastmile.com',
  smsApiKey: process.env.SMS_API_KEY || 'mock_key',
};
