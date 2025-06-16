import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FcmToken } from './entities/fcm-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class FcmTokenService {
  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepo: Repository<FcmToken>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(userId: User['id'], token: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(ErrorEnum.USER_NOT_FOUND);

    const fcmToken = await this.fcmTokenRepo.findOne({
      where: { user: { id: userId }, token },
    });
    if (fcmToken) return fcmToken;

    return this.fcmTokenRepo.save(this.fcmTokenRepo.create({ user, token }));
  }

  async remove(userId: User['id'], token: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(ErrorEnum.USER_NOT_FOUND);

    const fcmToken = await this.fcmTokenRepo.findOne({
      where: { user: { id: userId }, token },
    });
    if (fcmToken) return this.fcmTokenRepo.remove(fcmToken);
  }
}
