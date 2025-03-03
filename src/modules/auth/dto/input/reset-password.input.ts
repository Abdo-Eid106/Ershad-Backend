import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordInput {
  @IsString()
  email: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  // @Matches(/(?=.*[a-z])/, {
  //   message: 'Password must contain at least one lowercase letter',
  // })
  // @Matches(/(?=.*[A-Z])/, {
  //   message: 'Password must contain at least one uppercase letter',
  // })
  // @Matches(/(?=.*\d)/, {
  //   message: 'Password must contain at least one number',
  // })
  // @Matches(/(?=.*[@$!%*?&])/, {
  //   message: 'Password must contain at least one special character (@$!%*?&)',
  // })
  // @Matches(/^[A-Za-z\d@$!%*?&]*$/, {
  //   message:
  //     'Password can only contain letters, numbers, and special characters (@$!%*?&)',
  // })
  password: string;
}
