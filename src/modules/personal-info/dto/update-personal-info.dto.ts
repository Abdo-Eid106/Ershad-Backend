import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender } from 'src/shared/enums/gender.enum';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

class NameDto {
  @IsString({ message: ErrorEnum.NAME_EN_REQUIRED })
  en: string;

  @IsString({ message: ErrorEnum.NAME_AR_REQUIRED })
  ar: string;
}

export class UpdatePersonalInfoDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => NameDto)
  name: NameDto;

  @IsIn(Object.values(Gender), {
    message: ErrorEnum.GENDER_INVALID,
  })
  gender: Gender;

  @IsString({ message: ErrorEnum.NATIONAL_ID_STRING })
  nationalId: string;

  @IsString({ message: ErrorEnum.UNIVERSITY_ID_STRING })
  universityId: string;

  @IsString({ message: ErrorEnum.EMAIL_STRING })
  @IsEmail({}, { message: ErrorEnum.EMAIL_INVALID })
  email: string;

  @IsString({ message: ErrorEnum.PHONE_STRING })
  @IsPhoneNumber(undefined, { message: ErrorEnum.PHONE_INVALID })
  phone: string;
}
