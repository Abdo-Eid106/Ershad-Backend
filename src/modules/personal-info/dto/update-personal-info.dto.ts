import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender } from 'src/shared/enums/gender.enum';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

class NameDto {
  @IsString({ message: ErrorEnum.PERSONAL_INFO_NAME_EN_REQUIRED })
  en: string;

  @IsString({ message: ErrorEnum.PERSONAL_INFO_NAME_AR_REQUIRED })
  ar: string;
}

export class UpdatePersonalInfoDto {
  @ValidateNested()
  @Type(() => NameDto)
  name: NameDto;

  @IsIn(Object.values(Gender), {
    message: ErrorEnum.PERSONAL_INFO_GENDER_INVALID,
  })
  gender: Gender;

  @IsString({ message: ErrorEnum.PERSONAL_INFO_NATIONAL_ID_STRING })
  nationalId: string;

  @IsString({ message: ErrorEnum.PERSONAL_INFO_UNIVERSITY_ID_STRING })
  universityId: string;

  @IsString({ message: ErrorEnum.PERSONAL_INFO_EMAIL_STRING })
  @IsEmail({}, { message: ErrorEnum.PERSONAL_INFO_EMAIL_INVALID })
  email: string;

  @IsString({ message: ErrorEnum.PERSONAL_INFO_PHONE_STRING })
  @IsPhoneNumber(undefined, { message: ErrorEnum.PERSONAL_INFO_PHONE_INVALID })
  phone: string;
}
