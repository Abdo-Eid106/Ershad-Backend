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
  @IsUUID('4', { message: ErrorEnum.SEMESTER_COURSE_ID_UUID })
  courseId: UUID;

  @IsInt({ message: ErrorEnum.SEMESTER_DEGREE_INT })
  @Min(0, { message: ErrorEnum.SEMESTER_DEGREE_MIN })
  @Max(100, { message: ErrorEnum.SEMESTER_DEGREE_MAX })
  degree: number;
}

export class CreateSemesterDto {
  @IsInt({ message: ErrorEnum.SEMESTER_START_YEAR_INT })
  @Min(2019, { message: ErrorEnum.SEMESTER_START_YEAR_MIN })
  startYear: number;

  @IsInt({ message: ErrorEnum.SEMESTER_END_YEAR_INT })
  @Min(2020, { message: ErrorEnum.SEMESTER_END_YEAR_MIN })
  endYear: number;

  @IsInt({ message: ErrorEnum.SEMESTER_SEMESTER_INT })
  @Min(1, { message: ErrorEnum.SEMESTER_SEMESTER_MIN })
  @Max(2, { message: ErrorEnum.SEMESTER_SEMESTER_MAX })
  semester: number;

  @IsArray({ message: ErrorEnum.SEMESTER_COURSES_ARRAY })
  @ValidateNested({ message: ErrorEnum.SEMESTER_COURSES_NESTED })
  @Type(() => CreateSemesterCourse)
  semesterCourses: CreateSemesterCourse[];
}
