import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID } from 'crypto';
import { NameDto } from 'src/modules/regulation/dto/create-regulation.dto';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class CreateProgramDto {
  @ValidateNested()
  @Type(() => NameDto)
  name: object;

  @IsString({ message: ErrorEnum.PROGRAM_CODE_STRING })
  code: string;

  @IsString({ message: ErrorEnum.PROGRAM_DEGREE_STRING })
  degree: string;

  @IsUUID(undefined, { message: ErrorEnum.PROGRAM_REGULATION_ID_UUID })
  regulationId: UUID;
}
