import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Register } from 'src/entities/register';
import { Equal, MoreThan, Repository } from 'typeorm';

const secretKey = Buffer.from('19386242917565235250');
let counter = new Date().getSeconds();

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(Register)
    private registeRepository: Repository<Register>,
  ) {}

  async registerUser(name: string, email: string, otp: string) {
    const date = new Date();

    const ret = await this.registeRepository.findOne({
      where: {
        name: Equal(name),
        email: Equal(email),
        otp: Equal(otp),
        expire_at: MoreThan(date),
      },
    });
    if (!ret) {
      throw new NotFoundException();
    }

    return true;
  }

  async sendTestMail(name: string, mailAdress: string) {
    // ワンタイムパスワードの作成
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));

    const hmac = crypto
      .createHmac('sha1', secretKey)
      .update(counterBuffer)
      .digest();

    const offset = hmac[19] & 0x0f;

    const binary1 = (hmac[offset] & 0x7f) << 24;
    const binary2 = (hmac[offset + 1] & 0xff) << 16;
    const binary3 = (hmac[offset + 2] & 0xff) << 8;
    const binary4 = hmac[offset + 3] & 0xff;

    const binary = binary1 | binary2 | binary3 | binary4;

    const otp = (binary % 1_000_000).toString().padStart(6, '0');
    counter = (binary - Number(otp)) / 1_000_000;
    const date = new Date();
    counter +=
      date.getSeconds() % 2
        ? -date.getSeconds()
        : date.getSeconds() * date.getMilliseconds();

    // メール送信
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: mailAdress,
      subject: 'test',
      html: `<p>Hello! ${name} Please access this URL to sign in our bulletin borad!</p>
      <br><a href="http://localhost:3000/signup/mailauth?name=${name}&email=${mailAdress}">アカウント確認</a>
      <br><div>email: ${mailAdress}</div>
      <br><div>One Time Password: ${otp}</div>`,
    };

    transporter.sendMail(mailOptions);

    // 有効期限
    const expire = new Date();
    expire.setDate(expire.getDate() + 1);

    // 登録情報を格納
    const register = {
      name: name,
      email: mailAdress,
      otp: otp,
      expire_at: expire,
      created_at: new Date(),
    };

    await this.registeRepository.save(register);

    return true;
  }
}
