import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Register } from 'src/entities/register';
import { Equal, MoreThan, Repository } from 'typeorm';
import { User } from 'src/entities/user';

const secretKey = Buffer.from(String(process.env.OTP_SECRET_KEY));
let counter = new Date().getSeconds();

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(Register)
    private registeRepository: Repository<Register>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  async sendRegisteMail(name: string, mailAdress: string) {
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
      subject: 'One time password',
      html:
        `<p>Hello! ${name} Please access this URL to sign in our bulletin borad!</p>
      <br><a href=${process.env.FRONTEND_DOMAIN}` +
        `/signup/mailauth?name=${name}&email=${mailAdress}>アカウント確認</a>
      <br><div>email: ${mailAdress}</div>
      <br><div>One Time Password: ${otp}</div>`,
    };

    transporter.sendMail(mailOptions);

    // 有効期限
    const expire = new Date();
    expire.setDate(expire.getDate() + 1);

    // ワンタイムパスワード発行履歴があるか
    const pre_registe = await this.registeRepository.findOne({
      where: {
        name: Equal(name),
        email: Equal(mailAdress),
      },
    });

    // 登録情報を格納
    const register = {
      name: name,
      email: mailAdress,
      otp: otp,
      expire_at: expire,
      created_at: new Date(),
    };

    // 発行履歴があるなら上書き保存
    if (pre_registe) {
      await this.registeRepository
        .createQueryBuilder('register_rep')
        .update(Register)
        .set(register)
        .where('name = :name', { name })
        .execute();
    } else {
      await this.registeRepository.save(register);
    }

    return true;
  }

  async sendResetpassMail(name: string, mailAdress: string) {
    // アカウントを持っているか確認
    const user = await this.userRepository.findOne({
      where: {
        name: Equal(name),
        email: Equal(mailAdress),
      },
    });
    if (!user) {
      throw new NotFoundException();
    }

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
      subject: 'Reset Password',
      html:
        `<p>Hello! ${name} Please access this URL to reset your password</p>
      <br><a href=${process.env.FRONTEND_DOMAIN}` +
        `/resetpass/mailreset?name=${name}&email=${mailAdress}>アカウント確認</a>
      <br><div>email: ${mailAdress}</div>`,
    };

    transporter.sendMail(mailOptions);

    return true;
  }
}
