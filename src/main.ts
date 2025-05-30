import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

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
  const httpServer = app.getHttpServer();
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    socket.on('new_post', (post) => {
      io.emit('new_post', post);
    });
  });

  httpServer.listen(3001, '0,0,0,0', () => {});
}
bootstrap();
