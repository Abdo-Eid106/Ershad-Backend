import { IsString, Matches, MinLength } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class ResetPasswordInput {
  @IsString({ message: ErrorEnum.EMAIL_REQUIRED })
  email: string;

  @IsString({ message: ErrorEnum.OTP_REQUIRED })
  otp: string;

  @IsString({ message: ErrorEnum.PASSWORD_REQUIRED })
  @MinLength(8, { message: ErrorEnum.PASSWORD_MIN_LENGTH })
  @Matches(/(?=.*[a-z])/, {
    message: ErrorEnum.PASSWORD_LOWERCASE,
  })
  @Matches(/(?=.*[A-Z])/, {
    message: ErrorEnum.PASSWORD_UPPERCASE,
  })
  @Matches(/(?=.*\d)/, {
    message: ErrorEnum.PASSWORD_NUMBER,
  })
  @Matches(/(?=.*[@$!%*?&])/, {
    message: ErrorEnum.PASSWORD_SPECIAL_CHAR,
  })
  @Matches(/^[A-Za-z\d@$!%*?&]*$/, {
    message: ErrorEnum.PASSWORD_ALLOWED_CHARS,
  })
  password: string;
}
