import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'src/types/jwtpayload';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return this.userService.createUser(token, password);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Request() req: ExpressRequest & { user: JwtPayload }) {
    return await this.userService.getUser(req.user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Param('id') id: number,
  ) {
    return await this.userService.updateUser(name, email, password, id);
  }

  @Put()
  async resetPasswordUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('hidden_token') hidden_token: string,
  ) {
    return await this.userService.resetPasswordUser(
      name,
      email,
      password,
      hidden_token,
    );
  }
}
