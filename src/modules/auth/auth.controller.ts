import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/input/login.input';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { LoginOutput } from './dto/output/login.output';

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
