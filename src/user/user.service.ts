import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { User } from '../entities/user';
import { Equal, Not, Repository } from 'typeorm';
import { Register } from 'src/entities/register';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Register)
    private registerRepository: Repository<Register>,
  ) {}

  async getUser(id: number) {
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

  async createUser(token: string, password: string) {
    // token認証
    const register = await this.registerRepository.findOne({
      where: {
        token: Equal(token),
      },
    });

    if (!register) {
      throw new NotFoundException();
    }

    const hash = createHash('md5').update(password).digest('hex');
    const created_at = new Date();
    const record = {
      name: register.name,
      email: register.email,
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

  async updateUser(name: string, email: string, password: string, id: number) {
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

  async resetPasswordUser(
    name: string,
    email: string,
    password: string,
    hidden_token: string,
  ) {
    if (hidden_token !== process.env.RESET_PASS_TOKEN) {
      throw new UnauthorizedException();
    }

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
