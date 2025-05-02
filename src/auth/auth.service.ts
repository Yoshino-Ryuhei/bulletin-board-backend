import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from 'src/entities/auth';
import { User } from 'src/entities/user';
import { Equal, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,

    private JwtService: JwtService,
  ) {}

  async getAuth(name: string, password: string) {
    // name, passwordからUserレコード検索
    if (!password) {
      throw new UnauthorizedException();
    }
    const hash = crypto.createHash('md5').update(password).digest('hex');
    const user = await this.userRepository.findOne({
      where: {
        name: Equal(name),
        hash: Equal(hash),
      },
    });

    // 見つからなければ失敗
    if (!user) {
      throw new UnauthorizedException();
    }

    const ret = {
      token: '',
      user_id: user.id,
    };

    // 認証レコード作成
    const expire = new Date();
    expire.setDate(expire.getDate() + 1);
    const auth = await this.authRepository.findOne({
      where: {
        user_id: Equal(user.id),
      },
    });
    const payload = { id: user.id, username: user.name };
    if (auth) {
      // 更新
      auth.expire_at = expire;
      await this.authRepository.save(auth);
      ret.token = await this.JwtService.signAsync(payload);
    } else {
      // 挿入
      // Jwt生成
      const token = await this.JwtService.signAsync(payload);
      const record = {
        user_id: user.id,
        token: token,
        expire_at: expire.toISOString(),
      };
      await this.authRepository.save(record);
      ret.token = token;
    }
    return ret;
  }
}
