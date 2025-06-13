import { IsString, Matches, MinLength } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class UpdatePasswordDto {
  @IsString({ message: ErrorEnum.OLD_PASSWORD_STRING })
  oldPassword: string;

  @IsString({ message: ErrorEnum.NEW_PASSWORD_STRING })
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
  newPassword: string;
}
