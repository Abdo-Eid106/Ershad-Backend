import { IsIn, IsString, IsUUID, ValidateIf } from 'class-validator';
import { RequirementCategory } from '../enums/requirement-category.enum';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { Regulation } from 'src/modules/regulation/entities';
import { Program } from 'src/modules/program/entities/program.entitiy';

export class GetRequiremetsDto {
  @IsUUID('4', { message: ErrorEnum.REQUIREMENT_REGULATION_ID_UUID })
  regulationId: Regulation['id'];

  @IsString({ message: ErrorEnum.REQUIREMENT_OPTIONAL_STRING })
  optional: string;

  @IsIn(Object.values(RequirementCategory), {
    message: ErrorEnum.REQUIREMENT_CATEGORY_IN,
  })
  category: RequirementCategory;

  @ValidateIf((o) => o.type == RequirementCategory.SPECIALIZATION)
  @IsUUID('4', { message: ErrorEnum.REQUIREMENT_PROGRAM_ID_UUID })
  programId?: Program['id'];
}
