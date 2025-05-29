import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Min,
  IsUUID,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { UUID } from 'crypto';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class CourseName {
  @IsString({ message: ErrorEnum.COURSE_NAME_EN_REQUIRED })
  en: string;

  @IsString({ message: ErrorEnum.COURSE_NAME_AR_REQUIRED })
  ar: string;
}

export class CreateCourseDto {
  @Type(() => CourseName)
  @ValidateNested({ message: ErrorEnum.COURSE_NAME_OBJECT })
  name: CourseName;

  @IsString({ message: ErrorEnum.COURSE_CODE_REQUIRED })
  code: string;

  @IsInt({ message: ErrorEnum.LECTURE_HOURS_MIN })
  @Min(1, { message: ErrorEnum.LECTURE_HOURS_MIN })
  lectureHours: number;

  @IsInt({ message: ErrorEnum.PRACTICAL_HOURS_MIN })
  @Min(1, { message: ErrorEnum.PRACTICAL_HOURS_MIN })
  practicalHours: number;

  @IsInt({ message: ErrorEnum.CREDIT_HOURS_MIN })
  @Min(1, { message: ErrorEnum.CREDIT_HOURS_MIN })
  creditHours: number;

  @IsInt({ message: ErrorEnum.LEVEL_MIN })
  @Min(1, { message: ErrorEnum.LEVEL_MIN })
  level: number;

  @IsOptional()
  @IsString({ message: ErrorEnum.DESCRIPTION_STRING })
  description: string = '';

  @IsOptional()
  @IsUUID(undefined, { message: ErrorEnum.PREREQUISITE_UUID })
  prerequisiteId?: UUID;
}
