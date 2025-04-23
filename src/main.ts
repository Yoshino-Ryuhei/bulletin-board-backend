import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable cors at the server side.
  const corsOption = {
    origin: [`${process.env.FRONTEND_DOMAIN}`],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  };
  app.use(cors(corsOption));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
