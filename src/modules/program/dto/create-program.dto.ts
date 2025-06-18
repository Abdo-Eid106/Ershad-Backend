import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Regulation } from 'src/modules/regulation/entities';
import { NameDto } from 'src/modules/regulation/dto/create-regulation.dto';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class CreateProgramDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => NameDto)
  name: object;

  @IsString({ message: ErrorEnum.PROGRAM_CODE_STRING })
  code: string;

  @IsString({ message: ErrorEnum.PROGRAM_DEGREE_STRING })
  degree: string;

  @IsUUID(undefined, { message: ErrorEnum.REGULATION_ID_UUID })
  regulationId: Regulation['id'];
}
