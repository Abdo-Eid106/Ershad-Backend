import { IsBoolean, IsIn, IsUUID, ValidateIf } from 'class-validator';
import { RequirementCategory } from '../enums/requirement-category.enum';
import { UUID } from 'crypto';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class CreateRequirementDto {
  @IsUUID('4', { message: ErrorEnum.REQUIREMENT_COURSE_ID_UUID })
  courseId: UUID;

  @IsUUID('4', { message: ErrorEnum.REQUIREMENT_REGULATION_ID_UUID })
  regulationId: UUID;

  @IsBoolean({ message: ErrorEnum.REQUIREMENT_OPTIONAL_BOOLEAN })
  optional: boolean;

  @IsIn(Object.values(RequirementCategory), {
    message: ErrorEnum.REQUIREMENT_CATEGORY_IN,
  })
  category: RequirementCategory;

  @ValidateIf((o) => o.type == RequirementCategory.SPECIALIZATION)
  @IsUUID('4', { message: ErrorEnum.REQUIREMENT_PROGRAM_ID_UUID })
  programId?: UUID;
}
