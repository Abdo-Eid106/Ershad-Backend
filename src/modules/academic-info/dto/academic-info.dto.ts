import { Expose, Type } from 'class-transformer';
import { UUID } from 'crypto';
import { ProgramDto } from 'src/modules/program/dto';

class NameDto {
  @Expose()
  en: string;

  @Expose()
  ar: string;
}

class RegulationDto {
  @Expose()
  id: UUID;

  @Expose()
  @Type(() => NameDto)
  name: NameDto;
}

export class AcademicInfoDto {
  @Expose()
  attemptedHours: number;

  @Expose()
  gainedHours: number;

  @Expose()
  gpa: number;

  @Expose()
  level: number;

  @Expose()
  @Type(() => RegulationDto)
  regulation: RegulationDto;

  @Expose()
  @Type(() => ProgramDto)
  program: ProgramDto;
}
