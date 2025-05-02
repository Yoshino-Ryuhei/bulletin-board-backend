import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserIconService } from './user-icon.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'src/types/jwtpayload';
import { AuthGuard } from '@nestjs/passport';

@Controller('user-icon')
export class UserIconController {
  constructor(private readonly userIconService: UserIconService) {}

  @Post(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('id') id: number,
    @Request() req: ExpressRequest & { user: JwtPayload },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const payload = req.user;
    const imageUrl = await this.userIconService.upload(payload, file);
    return imageUrl;
  }

  @Get(':id')
  async getIconURL(@Param('id') id: number) {
    const imageUrl = await this.userIconService.getIconURL(id);
    return imageUrl;
  }
}
