import { IsIn, IsString, IsUUID, ValidateIf } from 'class-validator';
import { RequirementCategory } from '../enums/requirement-category.enum';
import { UUID } from 'crypto';

export class GetRequiremetsDto {
  @IsUUID()
  regulationId: UUID;

  @IsString()
  optional: string;

  @IsIn(Object.values(RequirementCategory))
  category: RequirementCategory;

  @ValidateIf((o) => o.type == RequirementCategory.SPECIALIZATION)
  @IsUUID()
  programId?: UUID;
}
