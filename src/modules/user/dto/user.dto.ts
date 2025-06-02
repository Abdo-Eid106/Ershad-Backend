import { Expose } from 'class-transformer';
import { User } from '../entities/user.entity';

export class UserDto {
  @Expose()
  id: User['id'];

  @Expose()
  email: string;

  @Expose()
  role: string;
}
