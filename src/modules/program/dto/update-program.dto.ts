import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { NameDto } from 'src/modules/regulation/dto/create-regulation.dto';

export class UpdateProgramDto {
  @ValidateNested()
  @Type(() => NameDto)
  name: object;

  @IsString()
  code: string;

  @IsString()
  degree: string;
}
