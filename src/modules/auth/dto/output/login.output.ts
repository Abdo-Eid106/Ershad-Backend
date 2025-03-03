import { Expose, Type } from 'class-transformer';

export class LoggedInUser {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  role: string;
}

export class LoginOutput {
  @Expose()
  token: string;

  @Expose()
  @Type(() => LoggedInUser)
  user: LoggedInUser;
}
