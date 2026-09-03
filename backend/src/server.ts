import app from './app';
import { config, connectDB, prisma } from './config';

async function startServer() {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`🚀 FINORA Backend running on port ${config.port}`);
    console.log(`📚 API Documentation available at http://localhost:${config.port}/api/docs`);
    console.log(`🩺 Health check available at http://localhost:${config.port}/api/health`);
  });

  const shutdown = async () => {
    console.log('⏳ Gracefully shutting down server...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('👋 Database disconnected. Goodbye!');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
