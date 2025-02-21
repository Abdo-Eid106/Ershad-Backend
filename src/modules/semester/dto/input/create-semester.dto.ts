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

export class CreateSemesterDto {
  @IsInt()
  @Min(2019)
  startYear: number;

  @IsInt()
  @Min(2020)
  endYear: number;

  @IsInt()
  @Min(1)
  @Max(2)
  semester: number;

  @IsArray()
  @ValidateNested()
  @Type(() => CreateSemesterCourse)
  semesterCourses: CreateSemesterCourse[];
}
