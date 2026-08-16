import app from './app';
import { config } from './config/env';
import { prisma } from './config/database';
import { verifyEmailConnection } from './services/email.service';
import { startEmailScheduler } from './services/email.scheduler';
import { execSync } from 'child_process';

// ─── Auto-push schema in production (Vercel / Render / Koyeb cold starts) ─────
if (process.env.NODE_ENV === 'production') {
  try {
    console.log('[DB] Running prisma db push...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('[DB] ✅ Schema synced successfully.');
  } catch (err) {
    console.warn('[DB] ⚠️  prisma db push failed (non-fatal):', err);
  }
}


let server: any;
let currentPort = config.PORT;

const startServer = (port: number) => {
  server = app.listen(port, async () => {
    console.log(`🚀 Server running on http://localhost:${port}`);

    // Verify email SMTP connection
    const emailReady = await verifyEmailConnection();

    // Start the interview reminder cron scheduler
    startEmailScheduler();

    if (!emailReady) {
      console.warn('[Server] ⚠️  Email not configured. Set SMTP_USER & SMTP_PASS in .env to enable emails.');
      console.warn('[Server]     Generate a Gmail App Password at: https://myaccount.google.com/apppasswords');
    }
  });

  server.on('error', async (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is busy. Trying ${port + 1}...`);
      server.close();
      startServer(port + 1);
    } else {
      console.error(error);
      process.exit(1);
    }
  });
};

startServer(currentPort);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  server?.close();
  process.exit(0);
});