import { Expose, Type } from 'class-transformer';
import { UUID } from 'crypto';
import { Gender } from 'src/shared/enums/gender.enum';

class NameDto {
  @Expose()
  en: string;

  @Expose()
  ar: string;
}

export class PersonalInfoDto {
  @Expose()
  id: UUID;

  @Expose()
  @Type(() => NameDto)
  name: NameDto;

  @Expose()
  gender: Gender;

  @Expose()
  nationalId: string;

  @Expose()
  universityId: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;
}
