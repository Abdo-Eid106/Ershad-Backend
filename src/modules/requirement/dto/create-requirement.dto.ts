import { IsBoolean, IsIn, IsUUID, ValidateIf } from 'class-validator';
import { RequirementCategory } from '../enums/requirement-category.enum';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { Course } from 'src/modules/course/entites/course.entity';
import { Regulation } from 'src/modules/regulation/entities';
import { Program } from 'src/modules/program/entities/program.entitiy';

export class CreateRequirementDto {
  @IsUUID('4', { message: ErrorEnum.COURSE_ID_UUID })
  courseId: Course['id'];

  @IsUUID('4', { message: ErrorEnum.REGULATION_ID_UUID })
  regulationId: Regulation['id'];

  @IsBoolean({ message: ErrorEnum.OPTIONAL_BOOLEAN })
  optional: boolean;

  @IsIn(Object.values(RequirementCategory), {
    message: ErrorEnum.CATEGORY_IN,
  })
  category: RequirementCategory;

  @ValidateIf((o) => o.type == RequirementCategory.SPECIALIZATION)
  @IsUUID('4', { message: ErrorEnum.PROGRAM_ID_UUID })
  programId?: Program['id'];
}
