const { app, env, prisma } = require('./src/app');

const server = app.listen(env.port, () => {
  console.log(`Aspirasi Rakyat API listening on http://localhost:${env.port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
