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
  @IsString({ message: ErrorEnum.ADMIN_NAME_EN_REQUIRED })
  en: string;

  @IsString({ message: ErrorEnum.ADMIN_NAME_AR_REQUIRED })
  ar: string;
}

export class CreateAdminDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => NameDto)
  name: NameDto;

  @IsString({ message: ErrorEnum.ADMIN_EMAIL_REQUIRED })
  @IsEmail({}, { message: ErrorEnum.ADMIN_EMAIL_INVALID })
  email: string;

  @IsString({ message: ErrorEnum.ADMIN_PASSWORD_REQUIRED })
  @MinLength(8, { message: ErrorEnum.ADMIN_PASSWORD_MIN_LENGTH })
  // @Matches(/(?=.*[a-z])/, {
  //   message: 'Password must contain at least one lowercase letter',
  // })
  // @Matches(/(?=.*[A-Z])/, {
  //   message: 'Password must contain at least one uppercase letter',
  // })
  // @Matches(/(?=.*\d)/, {
  //   message: 'Password must contain at least one number',
  // })
  // @Matches(/(?=.*[@$!%*?&])/, {
  //   message: 'Password must contain at least one special character (@$!%*?&)',
  // })
  // @Matches(/^[A-Za-z\d@$!%*?&]*$/, {
  //   message:
  //     'Password can only contain letters, numbers, and special characters (@$!%*?&)',
  // })
  password: string;
}
