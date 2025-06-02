import { Expose, Type } from 'class-transformer';
import { CourseDto } from 'src/modules/course/dto/course.dto';
import { RequirementCourse } from '../entities/requirement-course.entity';

export class RequirementDto {
  @Expose()
  id: RequirementCourse['id'];

  @Expose()
  @Type(() => CourseDto)
  course: CourseDto;
}
