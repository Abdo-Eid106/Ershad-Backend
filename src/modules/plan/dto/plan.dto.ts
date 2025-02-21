import { Expose, Type } from 'class-transformer';
import { UUID } from 'crypto';
import { CourseDto } from 'src/modules/course/dto/course.dto';

class NameDto {
  @Expose()
  en: string;

  @Expose()
  ar: string;
}

class PlanCourse {
  @Expose()
  level: number;

  @Expose()
  semester: number;

  @Expose()
  @Type(() => CourseDto)
  course: CourseDto;
}

export class PlanDto {
  @Expose()
  id: UUID;

  @Expose()
  levels: number;

  @Expose()
  @Type(() => NameDto)
  programName: NameDto;

  @Expose()
  @Type(() => PlanCourse)
  planCourses: PlanCourse[];
}
