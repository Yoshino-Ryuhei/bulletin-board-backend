import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { AuthModule } from './auth/auth.module';
import { config } from 'dotenv';
import { MailModule } from './mail/mail.module';
import { UserIconModule } from './user-icon/user-icon.module';
config({ path: '.env' });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',

      host: process.env.DB_HOST,

      username: process.env.DB_USER,

      password: process.env.DB_PASS,

      database: process.env.DB_NAME,

      autoLoadEntities: true,

      synchronize: false,
    }),
    UserModule,
    PostModule,
    AuthModule,
    MailModule,
    UserIconModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
