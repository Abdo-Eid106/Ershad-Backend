import { Expose, Type } from 'class-transformer';
import { Semester } from '../../entities/semester.entity';
import { Course } from 'src/modules/course/entites/course.entity';

class NameDto {
  @Expose()
  en: string;

  @Expose()
  ar: string;
}

class CourseDto {
  @Expose()
  courseId: Course['id'];

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

  @Expose()
  gpa: number;
}

export class SemestersDto {
  @Expose()
  id: Semester['id'];

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
  @Type(() => CourseDto)
  courses: CourseDto[];
}
