import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('registration')
  async registerUser(
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('otp') otp: string,
  ) {
    return await this.mailService.registerUser(name, email, otp);
  }

  @Post('send')
  async sendEmail(
    @Body('name') name: string,
    @Body('email') mailAdress: string,
  ) {
    return await this.mailService.sendTestMail(name, mailAdress);
  }
}
