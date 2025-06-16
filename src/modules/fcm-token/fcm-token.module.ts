import { Module } from '@nestjs/common';
import { FcmTokenService } from './fcm-token.service';
import { FcmTokenController } from './fcm-token.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { FcmToken } from './entities/fcm-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, FcmToken])],
  providers: [FcmTokenService],
  controllers: [FcmTokenController],
})
export class FcmTokenModule {}
