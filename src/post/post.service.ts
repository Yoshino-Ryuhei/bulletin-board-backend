import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MicroPost } from 'src/entities/microposts';
import { JwtPayload } from 'src/types/jwtpayload';
// import { JwtPayload } from 'src/types/jwtpayload';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(MicroPost)
    private microPostsRepository: Repository<MicroPost>,
  ) {}

  async createPost(message: string, payload) {
    const record = {
      user_id: payload.id,
      content: message,
    };
    await this.microPostsRepository.save(record);
  }

  async getList(start: number = 0, nr_recodes: number = 1, word: string = '') {
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

  async deletePost(message: string, payload: JwtPayload) {
    const deletePost = await this.microPostsRepository.findOne({
      where: {
        user_id: Equal(payload.id),
        content: Equal(message),
      },
    });

    if (!deletePost) {
      throw new NotFoundException();
    }
    await this.microPostsRepository.delete({ id: deletePost.id });
  }
}
