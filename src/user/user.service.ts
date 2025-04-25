import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Auth } from '../entities/auth';
import { User } from '../entities/user';
import { Equal, MoreThan, Not, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async getUser(token: string, id: number) {
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
    return user;
  }

  async createUser(name: string, email: string, password: string) {
    const hash = createHash('md5').update(password).digest('hex');
    const created_at = new Date();
    const record = {
      name: name,
      email: email,
      hash: hash,
      created_at: created_at,
    };

    const sameEmailUser = await this.userRepository.findOne({
      where: {
        email: Equal(record.email),
      },
    });

    if (sameEmailUser) {
      throw new ConflictException();
    }

    await this.userRepository.save(record);
    return record;
  }

  async updateUser(
    name: string,
    email: string,
    password: string,
    id: number,
    token: string,
  ) {
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

    // ユーザーを見つける
    const user = await this.userRepository.findOne({
      where: {
        id: Equal(id),
      },
    });
    if (!user) {
      throw new NotFoundException();
    }

    // 自分以外で同じemailが使われていないか確認
    const sameEmailUser = await this.userRepository.findOne({
      where: {
        id: Not(id),
        email: Equal(email),
      },
    });

    if (sameEmailUser) {
      throw new ConflictException();
    }

    const hash = createHash('md5').update(password).digest('hex');
    const updated_at = new Date();
    const record = {
      name: name,
      email: email,
      hash: hash,
      created_at: user.created_at,
      updated_at: updated_at,
    };

    await this.userRepository
      .createQueryBuilder('user_rep')
      .update(User)
      .set(record)
      .where('id = :id', { id })
      .execute();

    return record;
  }

  async resetPasswordUser(name: string, email: string, password: string) {
    // ユーザーを見つける
    const user = await this.userRepository.findOne({
      where: {
        name: Equal(name),
        email: Equal(email),
      },
    });
    if (!user) {
      throw new NotFoundException();
    }

    const newHash = createHash('md5').update(password).digest('hex');
    const newPassUser = {
      id: user.id,
      name: name,
      hash: newHash,
      email: email,
      icon_url: user.icon_url,
      created_at: user.created_at,
      updated_at: new Date(),
    };

    await this.userRepository
      .createQueryBuilder('user_rep')
      .update(User)
      .set(newPassUser)
      .where('id = :id', { id: user.id })
      .execute();

    return true;
  }
}
