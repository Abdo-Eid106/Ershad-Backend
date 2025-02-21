import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID } from 'crypto';
import { NameDto } from 'src/modules/regulation/dto/create-regulation.dto';

export class CreateProgramDto {
  @ValidateNested()
  @Type(() => NameDto)
  name: object;

  @IsString()
  code: string;

  @IsString()
  degree: string;

  @IsUUID()
  regulationId: UUID;
}
