import { IsOptional, IsUUID } from 'class-validator';
import { Regulation } from 'src/modules/regulation/entities';

export class GetProgramsDto {
  @IsOptional()
  @IsUUID()
  regulationId: Regulation['id'];
}
