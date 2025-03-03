import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller()
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('otp')
  async sendOtp(@Body() { email }: SendOtpDto) {
    await this.otpService.sendOtp(email);
    return { message: 'check your email' };
  }

  @Post('verify-otp')
  async verify(@Body() { email, otp }: VerifyOtpDto) {
    await this.otpService.verifyOtp(email, otp);
    return { message: 'OTP verified successfully' };
  }
}
