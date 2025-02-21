import { Expose, Type } from 'class-transformer';

class UserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;
}

export class LoginOutput {
  @Expose()
  token: string;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}
