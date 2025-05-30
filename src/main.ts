import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

import { createServer } from 'http';
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
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('connect client');

    socket.on('new_post', (post) => {
      io.emit('new_post', post);
      console.log(post);
    });
  });

  httpServer.listen(3001, () => {
    console.log('connect in 3001 port');
  });
}
bootstrap();
