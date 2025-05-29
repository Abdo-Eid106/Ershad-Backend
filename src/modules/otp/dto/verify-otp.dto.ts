import { IsString } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class VerifyOtpDto {
  @IsString({ message: ErrorEnum.EMAIL_STRING })
  email: string;

  @IsString({ message: ErrorEnum.OTP_REQUIRED })
  otp: string;
}
