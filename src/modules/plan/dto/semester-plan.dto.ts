import { Expose } from 'class-transformer';
import { CourseDto } from 'src/modules/course/dto/course.dto';

export class SemesterPlanDto {
  @Expose()
  level: number;

  @Expose()
  semester: number;

  @Expose()
  courses: CourseDto[];
}
