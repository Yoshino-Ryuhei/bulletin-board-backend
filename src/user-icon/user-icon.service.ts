import { Injectable, NotFoundException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import 'multer';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { User } from 'src/entities/user';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { JwtPayload } from 'src/types/jwtpayload';

@Injectable()
export class UserIconService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  state = uuidv4();

  async upload(payload: JwtPayload, file: Express.Multer.File) {
    const key = `user-icons/${payload.id}/${this.state}`;
    const resizedFile = await sharp(file.buffer)
      .resize({ width: 128, height: 128 })
      .jpeg({ quality: 80 })
      .toBuffer();

    await this.s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: resizedFile,
        ContentType: file.mimetype,
      }),
    );

    // dbのアイコンを変更
    const user = await this.userRepository.findOne({
      where: {
        id: Equal(payload.id),
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const oldIconKey = user.icon_url;
    user.icon_url = key;
    await this.userRepository.save(user);

    if (oldIconKey && oldIconKey !== key) {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: oldIconKey,
        }),
      );
    }

    return key;
  }

  async getIconURL(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: Equal(id),
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const key = user.icon_url;
    if (!key) {
      return;
    }

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      }),
    );

    return url;
  }
}
