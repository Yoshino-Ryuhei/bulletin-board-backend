import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

// import { createServer } from 'http';
import * as express from 'express';
import { Server } from 'socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable cors at the server side.
  const corsOption = {
    origin: [`${process.env.FRONTEND_DOMAIN}`],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  };
  app.use(cors(corsOption));
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  await app.listen(process.env.PORT ?? 3000);

  // websocket
  const PORT = process.env.WEBSOCKET_PORT || 3001;
  const INDEX = '/index.html';
  const server = express()
    .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET'] },
  });

  io.on('connection', (socket) => {
    socket.on('new_post', (post) => {
      io.emit('new_post', post);
    });
  });

  server.listen(PORT, () => {});
}
bootstrap();
