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
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

class CreateSemesterCourse {
  @IsUUID('4', { message: ErrorEnum.COURSE_IDS_UUID })
  courseId: UUID;

  @IsInt({ message: ErrorEnum.SEMESTER_DEGREE_INT })
  @Min(0, { message: ErrorEnum.SEMESTER_DEGREE_MIN })
  @Max(100, { message: ErrorEnum.SEMESTER_DEGREE_MAX })
  degree: number;
}

export class UpdateSemesterDto {
  @IsArray({ message: ErrorEnum.SEMESTER_COURSES_ARRAY })
  @ValidateNested({ message: ErrorEnum.SEMESTER_COURSES_NESTED })
  @Type(() => CreateSemesterCourse)
  semesterCourses: CreateSemesterCourse[];
}
