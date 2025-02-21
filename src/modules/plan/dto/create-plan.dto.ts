import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { UUID } from 'crypto';

export class CreatePlanCourse {
  @IsUUID()
  courseId: UUID;

  @IsInt()
  @Min(1)
  level: number;

  @IsInt()
  @Min(1)
  @Max(2)
  semester: number;
}

export class CreatePlanDto {
  @IsUUID()
  programId: UUID;

  @IsArray()
  @ValidateNested()
  @Type(() => CreatePlanCourse)
  planCourses: CreatePlanCourse[];
}
