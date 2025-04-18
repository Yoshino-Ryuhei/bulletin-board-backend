import { Module } from '@nestjs/common';
import { UserIconController } from './user-icon.controller';
import { UserIconService } from './user-icon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { Auth } from 'src/entities/auth';

@Module({
  imports: [TypeOrmModule.forFeature([User, Auth])],
  controllers: [UserIconController],
  providers: [UserIconService],
})
export class UserIconModule {}
