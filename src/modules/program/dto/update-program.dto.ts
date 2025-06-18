import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { NameDto } from 'src/modules/regulation/dto/create-regulation.dto';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class UpdateProgramDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => NameDto)
  name: object;

  @IsString({ message: ErrorEnum.PROGRAM_CODE_STRING })
  code: string;

  @IsString({ message: ErrorEnum.PROGRAM_DEGREE_STRING })
  degree: string;
}
