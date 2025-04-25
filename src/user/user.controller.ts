import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';

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
  async getUser(@Param('id') id: number, @Query('token') token: string) {
    return await this.userService.getUser(token, id);
  }

  @Patch(':id')
  async updateUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Param('id') id: number,
    @Query('token') token: string,
  ) {
    return await this.userService.updateUser(name, email, password, id, token);
  }

  @Put()
  async resetPasswordUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.userService.resetPasswordUser(name, email, password);
  }
}
