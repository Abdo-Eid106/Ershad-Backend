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
  @IsString({ message: ErrorEnum.OFFICER_NAME_EN_REQUIRED })
  en: string;

  @IsString({ message: ErrorEnum.OFFICER_NAME_AR_REQUIRED })
  ar: string;
}

export class CreateOfficerDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => NameDto)
  name: NameDto;

  @IsString({ message: ErrorEnum.OFFICER_EMAIL_REQUIRED })
  @IsEmail({}, { message: ErrorEnum.OFFICER_EMAIL_INVALID })
  email: string;

  @IsString({ message: ErrorEnum.OFFICER_PASSWORD_REQUIRED })
  @MinLength(8, { message: ErrorEnum.OFFICER_PASSWORD_MIN_LENGTH })
  @Matches(/(?=.*[a-z])/, {
    message: ErrorEnum.OFFICER_PASSWORD_LOWERCASE,
  })
  @Matches(/(?=.*[A-Z])/, {
    message: ErrorEnum.OFFICER_PASSWORD_UPPERCASE,
  })
  @Matches(/(?=.*\d)/, {
    message: ErrorEnum.OFFICER_PASSWORD_NUMBER,
  })
  @Matches(/(?=.*[@$!%*?&])/, {
    message: ErrorEnum.OFFICER_PASSWORD_SPECIAL_CHAR,
  })
  @Matches(/^[A-Za-z\d@$!%*?&]*$/, {
    message: ErrorEnum.OFFICER_PASSWORD_ALLOWED_CHARS,
  })
  password: string;
}
