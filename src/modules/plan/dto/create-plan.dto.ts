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

export class CreateSemesterPlan {
  @IsInt()
  @Min(1)
  level: number;

  @IsInt()
  @Min(1)
  @Max(2)
  semester: number;

  @IsArray()
  @IsUUID('all', { each: true })
  courseIds: UUID[];
}

export class CreatePlanDto {
  @IsArray()
  @ValidateNested()
  @Type(() => CreateSemesterPlan)
  semesters: CreateSemesterPlan[];
}
