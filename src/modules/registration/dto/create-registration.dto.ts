import { IsArray, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class CreateRegistrationDto {
  @IsArray()
  @IsUUID('all', { each: true })
  courseIds: UUID[];
}
