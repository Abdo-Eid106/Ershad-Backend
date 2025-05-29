import { Expose, Type } from 'class-transformer';
import { Course } from '../entites/course.entity';

export class CourseDto {
  @Expose()
  id: Course['id'];

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
