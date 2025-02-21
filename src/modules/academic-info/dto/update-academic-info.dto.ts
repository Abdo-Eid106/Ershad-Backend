import { UUID } from 'crypto';
import { IsUUID } from 'class-validator';

export class UpdateAcademicInfoDto {
  @IsUUID()
  regulationId: UUID;
}
