import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from 'src/entities/auth';
import { MicroPost } from 'src/entities/microposts';
import { Equal, MoreThan, Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(MicroPost)
    private microPostsRepository: Repository<MicroPost>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async createPost(message: string, token: string) {
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
    const record = {
      user_id: auth.user_id,
      content: message,
    };
    await this.microPostsRepository.save(record);
  }

  async getList(
    token: string,
    start: number = 0,
    nr_recodes: number = 1,
    word: string = '',
  ) {
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

    const qb = await this.microPostsRepository
      .createQueryBuilder('micro_post')
      .leftJoinAndSelect('user', 'user', 'user.id=micro_post.user_id')
      .select([
        'micro_post.id as id',
        'user.name as user_name',
        'micro_post.content as content',
        'micro_post.created_at as created_at',
      ])
      .orderBy('micro_post.created_at', 'DESC')
      .offset(start)
      .limit(nr_recodes);

    if (word) {
      qb.andWhere('micro_post.content like :word', { word: `%${word}%` });
    }

    type ResultType = {
      id: number;
      content: string;
      user_name: string;
      created_at: Date;
    };
    const records = await qb.getRawMany<ResultType>();

    return records;
  }

  async deletePost(message: string, token: string) {
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

    const deletePost = await this.microPostsRepository.findOne({
      where: {
        user_id: Equal(auth.user_id),
        content: Equal(message),
      },
    });

    if (!deletePost) {
      throw new NotFoundException();
    }
    await this.microPostsRepository.delete({ id: deletePost.id });
  }
}
