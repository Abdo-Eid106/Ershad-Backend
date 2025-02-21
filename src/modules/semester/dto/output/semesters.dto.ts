import { Expose, Type } from 'class-transformer';
import { UUID } from 'crypto';

class NameDto {
  @Expose()
  en: string;

  @Expose()
  ar: string;
}

class CourseDto {
  @Expose()
  courseId: UUID;

  @Expose()
  @Type(() => NameDto)
  name: NameDto;

  @Expose()
  code: string;

  @Expose()
  creditHours: number;

  @Expose()
  degree: number;

  @Expose()
  grade: number;
}

export class SemestersDto {
  @Expose()
  id: UUID;

  @Expose()
  startYear: number;

  @Expose()
  endYear: number;

  @Expose()
  semester: number;

  @Expose()
  gainedHours: number;

  @Expose()
  totalHours: number;

  @Expose()
  gpa: number;

  @Expose()
  cumulativeGpa: number;

  @Expose()
  @Type(() => CourseDto)
  courses: CourseDto[];
}
