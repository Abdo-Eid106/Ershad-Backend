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
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class CreateSemesterPlan {
  @IsInt({ message: ErrorEnum.SEMESTER_PLAN_LEVEL_INT })
  @Min(1, { message: ErrorEnum.SEMESTER_PLAN_LEVEL_MIN })
  level: number;

  @IsInt({ message: ErrorEnum.SEMESTER_PLAN_SEMESTER_INT })
  @Min(1, { message: ErrorEnum.SEMESTER_PLAN_SEMESTER_MIN })
  @Max(2, { message: ErrorEnum.SEMESTER_PLAN_SEMESTER_MAX })
  semester: number;

  @IsArray({ message: ErrorEnum.SEMESTER_PLAN_COURSE_IDS_ARRAY })
  @IsUUID('all', {
    each: true,
    message: ErrorEnum.SEMESTER_PLAN_COURSE_IDS_UUID,
  })
  courseIds: UUID[];
}

export class CreatePlanDto {
  @IsArray({ message: ErrorEnum.PLAN_SEMESTERS_ARRAY })
  @ValidateNested({ each: true })
  @Type(() => CreateSemesterPlan)
  semesters: CreateSemesterPlan[];
}
