import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Otp } from './entities/otp.entity';
import { EmailModule } from 'src/shared/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp]), EmailModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
