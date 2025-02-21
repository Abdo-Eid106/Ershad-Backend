import {
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { UUID } from 'crypto';
import { Type } from 'class-transformer';

class CreateSemesterCourse {
  @IsUUID()
  courseId: UUID;

  @IsInt()
  @Min(0)
  @Max(100)
  degree: number;
}

export class UpdateSemesterDto {
  @IsArray()
  @ValidateNested()
  @Type(() => CreateSemesterCourse)
  semesterCourses: CreateSemesterCourse[];
}
