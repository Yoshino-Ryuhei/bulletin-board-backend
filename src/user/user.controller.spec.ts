import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let service: UserService; //差し替えようのサービス

  // テストごとに毎回呼ばれる処理

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn().mockReturnValue({}),
          },
        },
      ],
      controllers: [UserController],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  // テスト本体

  it('should be defined', async () => {
    const controller = new UserController(service);
    await controller.getUser(1, 'xxx-xxx-xxx-xxx');
    expect(service.getUser).toHaveBeenCalledTimes(1);
  });
});
