import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreatePlanCourse } from './create-plan.dto';

export class UpdatePlanDto {
  @IsArray()
  @ValidateNested()
  @Type(() => CreatePlanCourse)
  planCourses: CreatePlanCourse[];
}
