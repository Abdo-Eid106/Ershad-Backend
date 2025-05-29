import { IsString } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class LoginInput {
  @IsString({ message: ErrorEnum.EMAIL_REQUIRED })
  email: string;

  @IsString({ message: ErrorEnum.PASSWORD_REQUIRED })
  password: string;
}
