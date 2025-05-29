import { IsString } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class SendOtpDto {
  @IsString({ message: ErrorEnum.EMAIL_STRING })
  email: string;
}
