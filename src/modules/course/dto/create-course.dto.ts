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

export class CourseName {
  @IsString()
  en: string;

  @IsString()
  ar: string;
}

export class CreateCourseDto {
  @Type(() => CourseName)
  @ValidateNested({
    message: 'course name must be like this { en: string, ar: string }',
  })
  name: CourseName;

  @IsString()
  code: string;

  @IsInt()
  @Min(1)
  lectureHours: number;

  @IsInt()
  @Min(1)
  practicalHours: number;

  @IsInt()
  @Min(1)
  creditHours: number;

  @IsInt()
  @Min(1)
  level: number;

  @IsOptional()
  @IsString()
  description: string = '';

  @IsOptional()
  @IsUUID()
  prerequisiteId?: UUID;
}
