import { Expose, Type } from 'class-transformer';
import { CourseDto } from 'src/modules/course/dto/course.dto';
import { Program } from 'src/modules/program/entities/program.entitiy';

export class SemesterPlanDto {
  @Expose()
  level: number;

  @Expose()
  semester: number;

  @Expose()
  @Type(() => CourseDto)
  courses: CourseDto[];
}

export class PlanDto {
  @Expose()
  programId: Program['id'];

  @Expose()
  @Type(() => SemesterPlanDto)
  semesters: SemesterPlanDto[];
}
