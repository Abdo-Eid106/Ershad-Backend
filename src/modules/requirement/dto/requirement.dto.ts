import { Expose, Type } from 'class-transformer';
import { UUID } from 'crypto';
import { CourseDto } from 'src/modules/course/dto/course.dto';

export class RequirementDto {
  @Expose()
  id: UUID;

  @Expose()
  @Type(() => CourseDto)
  course: CourseDto;
}
