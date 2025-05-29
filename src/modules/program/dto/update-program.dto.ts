import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { NameDto } from 'src/modules/regulation/dto/create-regulation.dto';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class UpdateProgramDto {
  @ValidateNested({ message: ErrorEnum.PROGRAM_NAME_OBJECT })
  @Type(() => NameDto)
  name: object;

  @IsString({ message: ErrorEnum.PROGRAM_CODE_STRING })
  code: string;

  @IsString({ message: ErrorEnum.PROGRAM_DEGREE_STRING })
  degree: string;
}
