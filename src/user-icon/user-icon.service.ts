import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import 'multer';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { User } from 'src/entities/user';
import { Auth } from 'src/entities/auth';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, MoreThan, Repository } from 'typeorm';

@Injectable()
export class UserIconService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  state = uuidv4();

  async upload(token: string, id: number, file: Express.Multer.File) {
    // ログイン済みかチェック
    const now = new Date();
    const auth = await this.authRepository.findOne({
      where: {
        token: Equal(token),
        expire_at: MoreThan(now),
      },
    });
    if (!auth) {
      throw new ForbiddenException();
    }

    const key = `user-icons/${id}/${this.state}}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // ユーザーアイコンのurl取得をgetメソッドに変更
    // const url = await getSignedUrl(
    //   this.s3,
    //   new GetObjectCommand({
    //     Bucket: process.env.AWS_S3_BUCKET_NAME,
    //     Key: key,
    //   }),
    // );

    // dbのアイコンを変更
    const user = await this.userRepository.findOne({
      where: {
        id: Equal(id),
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    user.icon_url = key;
    await this.userRepository.save(user);

    return key;
  }

  async getIconURL(token: string, id: number) {
    console.log(token, id);
    // ログイン済みかチェック
    const now = new Date();
    const auth = await this.authRepository.findOne({
      where: {
        token: Equal(token),
        expire_at: MoreThan(now),
      },
    });
    if (!auth) {
      throw new ForbiddenException();
    }

    const user = await this.userRepository.findOne({
      where: {
        id: Equal(id),
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const key = user.icon_url;
    console.log(key);

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      }),
    );

    console.log(url);

    return url;
  }
}
