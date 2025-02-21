import { Expose, Type } from 'class-transformer';

class NameDto {
  @Expose()
  en: string;

  @Expose()
  ar: string;
}

export class AdminDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  @Type(() => NameDto)
  name: NameDto;
}
