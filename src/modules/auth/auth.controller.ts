import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { LoginInput, LoginOutput, ResetPasswordInput } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Serialize(LoginOutput)
  @HttpCode(200)
  login(@Body() loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordInput: ResetPasswordInput) {
    await this.authService.resetPassword(resetPasswordInput);
    return { message: 'Password has been successfully reset' };
  }
}
