import { Expose } from 'class-transformer';
import { UUID } from 'crypto';

export class UserDto {
  @Expose()
  id: UUID;

  @Expose()
  email: string;

  @Expose()
  role: string;
}
