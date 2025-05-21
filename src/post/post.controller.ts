import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
// import { JwtPayload } from 'src/types/jwtpayload';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createPost(
    @Body('message') message: string,
    @Request() req: ExpressRequest & { user: { id: number; username: string } },
  ) {
    const payload = req.user;
    return await this.postService.createPost(message, payload);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getList(
    @Query('start') start: number,
    @Query('records') records: number,
    @Query('word') word: string,
  ) {
    return await this.postService.getList(start, records, word);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async deletepost(
    @Query('id') id: number,
    @Request() req: ExpressRequest & { user: { id: number; username: string } },
  ) {
    const payload = req.user;
    return await this.postService.deletePost(id, payload);
  }
}
