import { IsString } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class UpdatePasswordDto {
  @IsString({ message: ErrorEnum.OLD_PASSWORD_STRING })
  oldPassword: string;

  @IsString({ message: ErrorEnum.NEW_PASSWORD_STRING })
  newPassword: string;
}
