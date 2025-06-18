import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Gender } from 'src/shared/enums/gender.enum';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { Regulation } from 'src/modules/regulation/entities';

class NameDto {
  @IsString({ message: ErrorEnum.NAME_EN_STRING })
  en: string;

  @IsString({ message: ErrorEnum.NAME_AR_STRING })
  ar: string;
}

export class CreateStudentDto {
  @IsNotEmpty()
  @ValidateNested({ message: ErrorEnum.NAME_OBJECT })
  @Type(() => NameDto)
  name: NameDto;

  @IsString({ message: ErrorEnum.NATIONAL_ID_STRING })
  nationalId: string;

  @IsString({ message: ErrorEnum.UNIVERSITY_ID_STRING })
  universityId: string;

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

  @IsPhoneNumber(undefined, { message: ErrorEnum.PHONE_INVALID })
  phone: string;

  @IsIn(Object.values(Gender), { message: ErrorEnum.GENDER_INVALID })
  gender: Gender;

  @IsUUID('4', { message: ErrorEnum.REGULATION_ID_UUID })
  regulationId: Regulation['id'];
}
