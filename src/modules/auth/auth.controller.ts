import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { LoginInput, LoginOutput, ResetPasswordInput } from './dto';
import { SuccessEnum } from 'src/shared/i18n/enums/success.enum';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Serialize(LoginOutput)
  @HttpCode(HttpStatus.OK)
  login(@Body() loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordInput: ResetPasswordInput) {
    await this.authService.resetPassword(resetPasswordInput);
    return { message: SuccessEnum.PASSWORD_RESET_SUCCESS };
  }
}
