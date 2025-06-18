import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

class NameDto {
  @IsString({ message: ErrorEnum.NAME_EN_REQUIRED })
  en: string;

  @IsString({ message: ErrorEnum.NAME_AR_REQUIRED })
  ar: string;
}

export class CreateOfficerDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => NameDto)
  name: NameDto;

  @IsString({ message: ErrorEnum.EMAIL_STRING })
  @IsEmail({}, { message: ErrorEnum.EMAIL_INVALID })
  email: string;

  @IsString({ message: ErrorEnum.PASSWORD_STRING })
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
