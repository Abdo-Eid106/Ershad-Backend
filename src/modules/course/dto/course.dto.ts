import { Expose, Type } from 'class-transformer';

export class CourseDto {
  @Expose()
  id: string;

  @Expose()
  name: { en: string; ar: string };

  @Expose()
  code: string;

  @Expose()
  lectureHours: number;

  @Expose()
  practicalHours: number;

  @Expose()
  creditHours: number;

  @Expose()
  level: number;

  @Expose()
  @Type(() => CourseDto)
  prerequisite?: CourseDto;

  @Expose()
  @Type(() => CourseDto)
  dependentCourses?: CourseDto[];
}
