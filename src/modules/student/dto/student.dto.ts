import { Expose, Type } from 'class-transformer';

class NameDto {
  @Expose()
  en: string;

  @Expose()
  ar: string;
}

export class StudentDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => NameDto)
  name: NameDto;

  @Expose()
  avatar?: string;
}
