import { IsBoolean, IsIn, IsUUID, ValidateIf } from 'class-validator';
import { RequirementCategory } from '../enums/requirement-category.enum';
import { UUID } from 'crypto';

export class CreateRequirementDto {
  @IsUUID()
  courseId: UUID;

  @IsUUID()
  regulationId: UUID;

  @IsBoolean()
  optional: boolean;

  @IsIn(Object.values(RequirementCategory))
  category: RequirementCategory;

  @ValidateIf((o) => o.type == RequirementCategory.SPECIALIZATION)
  @IsUUID()
  programId?: UUID;
}
