import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { hash, compare } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { EmailService } from 'src/shared/email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtp(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('no user found with this email');

    const otp = randomInt(0, 10000).toString().padStart(4, '0');
    const hashedOtp = await hash(otp, 10);
    const expirationMinutes = this.configService.get<number>(
      'OTP_EXPIRATION_MINUTES',
      5,
    );
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    await this.otpRepo.delete({ userId: user.id });
    await this.otpRepo.save(
      this.otpRepo.create({ value: hashedOtp, userId: user.id, expiresAt }),
    );

    return this.emailService.sendResetPasswordEmail(email, otp);
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['otp'],
    });
    if (!user) throw new NotFoundException('No user found with this email');

    if (
      !user.otp ||
      user.otp.expiresAt < new Date() ||
      !(await compare(otp, user.otp.value))
    )
      throw new BadRequestException('Invalid OTP');
    return true;
  }
}
