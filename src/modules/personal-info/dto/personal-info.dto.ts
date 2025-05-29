import { Expose, Type } from 'class-transformer';
import { Student } from 'src/modules/student/entities/student.entity';
import { Gender } from 'src/shared/enums/gender.enum';

class NameDto {
  @Expose()
  en: string;

  @Expose()
  ar: string;
}

export class PersonalInfoDto {
  @Expose()
  id: Student['userId'];

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

  @Expose()
  avatar: string;
}
