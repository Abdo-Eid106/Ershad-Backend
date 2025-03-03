import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { LoginInput, LoginOutput } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Serialize(LoginOutput)
  @HttpCode(200)
  login(@Body() loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }
}
