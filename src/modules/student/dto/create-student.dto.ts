import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { UUID } from 'crypto';
import { Gender } from 'src/shared/enums/gender.enum';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

class NameDto {
  @IsString({ message: ErrorEnum.STUDENT_NAME_EN_STRING })
  en: string;

  @IsString({ message: ErrorEnum.STUDENT_NAME_AR_STRING })
  ar: string;
}

export class CreateStudentDto {
  @ValidateNested({ message: ErrorEnum.STUDENT_NAME_NESTED })
  @Type(() => NameDto)
  name: NameDto;

  @IsString({ message: ErrorEnum.STUDENT_NATIONAL_ID_STRING })
  nationalId: string;

  @IsString({ message: ErrorEnum.STUDENT_UNIVERSITY_ID_STRING })
  universityId: string;

  @IsString({ message: ErrorEnum.STUDENT_EMAIL_STRING })
  @IsEmail({}, { message: ErrorEnum.STUDENT_EMAIL_INVALID })
  email: string;

  @IsString({ message: ErrorEnum.STUDENT_PASSWORD_STRING })
  @MinLength(8, { message: ErrorEnum.STUDENT_PASSWORD_MIN_LENGTH })
  @Matches(/(?=.*[a-z])/, {
    message: ErrorEnum.STUDENT_PASSWORD_LOWERCASE,
  })
  @Matches(/(?=.*[A-Z])/, {
    message: ErrorEnum.STUDENT_PASSWORD_UPPERCASE,
  })
  @Matches(/(?=.*\d)/, {
    message: ErrorEnum.STUDENT_PASSWORD_NUMBER,
  })
  @Matches(/(?=.*[@$!%*?&])/, {
    message: ErrorEnum.STUDENT_PASSWORD_SPECIAL_CHAR,
  })
  @Matches(/^[A-Za-z\d@$!%*?&]*$/, {
    message: ErrorEnum.STUDENT_PASSWORD_ALLOWED_CHARS,
  })
  password: string;

  @IsPhoneNumber(undefined, { message: ErrorEnum.STUDENT_PHONE_STRING })
  phone: string;

  @IsIn(Object.values(Gender), { message: ErrorEnum.STUDENT_GENDER_IN })
  gender: Gender;

  @IsUUID('4', { message: ErrorEnum.STUDENT_REGULATION_ID_UUID })
  regulationId: UUID;
}
