import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { Auth } from 'src/entities/auth';
import { Register } from 'src/entities/register';

@Module({
  imports: [TypeOrmModule.forFeature([User, Auth, Register])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
