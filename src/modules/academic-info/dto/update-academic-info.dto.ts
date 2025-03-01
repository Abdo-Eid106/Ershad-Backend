import { UUID } from 'crypto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateAcademicInfoDto {
  @IsUUID()
  regulationId: UUID;

  @IsUUID()
  @IsOptional()
  programId?: UUID;
}
