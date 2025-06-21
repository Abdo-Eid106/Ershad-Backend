import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Min,
  IsUUID,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { Course } from '../entites/course.entity';

export class CourseName {
  @IsString({ message: ErrorEnum.NAME_EN_STRING })
  en: string;

  @IsString({ message: ErrorEnum.NAME_AR_STRING })
  ar: string;
}

export class CreateCourseDto {
  @IsNotEmpty()
  @Type(() => CourseName)
  @ValidateNested({ message: ErrorEnum.NAME_OBJECT })
  name: CourseName;

  @IsString({ message: ErrorEnum.CODE_STRING })
  code: string;

  @IsInt({ message: ErrorEnum.LECTURE_HOURS_INTEGER })
  @Min(1, { message: ErrorEnum.LECTURE_HOURS_MIN })
  lectureHours: number;

  @IsInt({ message: ErrorEnum.PRACTICAL_HOURS_INTEGER })
  @Min(0, { message: ErrorEnum.PRACTICAL_HOURS_MIN })
  practicalHours: number;

  @IsInt({ message: ErrorEnum.CREDIT_HOURS_INTEGER })
  @Min(1, { message: ErrorEnum.CREDIT_HOURS_MIN })
  creditHours: number;

  @IsInt({ message: ErrorEnum.LEVEL_INTEGER })
  @Min(1, { message: ErrorEnum.LEVEL_MIN })
  level: number;

  @IsOptional()
  @IsString({ message: ErrorEnum.DESCRIPTION_STRING })
  description: string = '';

  @IsOptional()
  @IsUUID(undefined, { message: ErrorEnum.PREREQUISITE_UUID })
  prerequisiteId?: Course['id'];
}
