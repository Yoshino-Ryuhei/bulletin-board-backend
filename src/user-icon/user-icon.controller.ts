import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserIconService } from './user-icon.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user-icon')
export class UserIconController {
  constructor(private readonly userIconService: UserIconService) {}

  @Post(':id')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('id') id: number,
    @Query('token') token: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.userIconService.upload(token, id, file);
    return imageUrl;
  }

  @Get(':id')
  async getIconURL(@Param('id') id: number, @Query('token') token: string) {
    const imageUrl = await this.userIconService.getIconURL(token, id);
    return imageUrl;
  }
}
