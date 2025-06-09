import { Expose, Type } from 'class-transformer';
import { Warning } from '../entities/warning.entity';

class SemesterDto {
  @Expose()
  startYear: number;

  @Expose()
  endYear: number;

  @Expose()
  semester: number;
}

export class WarningDto {
  @Expose()
  id: Warning['id'];

  @Expose()
  gpa: number;

  @Expose()
  @Type(() => SemesterDto)
  semester: SemesterDto;
}
