import { IsOptional, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class GetProgramsDto {
  @IsOptional()
  @IsUUID()
  regulationId: UUID;
}
