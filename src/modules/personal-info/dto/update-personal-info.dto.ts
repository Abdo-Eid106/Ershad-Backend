import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender } from 'src/shared/enums/gender.enum';

class NameDto {
  @IsString()
  en: string;

  @IsString()
  ar: string;
}

export class UpdatePersonalInfoDto {
  @ValidateNested()
  @Type(() => NameDto)
  name: NameDto;

  @IsIn(Object.values(Gender))
  gender: Gender;

  @IsString()
  nationalId: string;

  @IsString()
  universityId: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsPhoneNumber()
  phone: string;
}
