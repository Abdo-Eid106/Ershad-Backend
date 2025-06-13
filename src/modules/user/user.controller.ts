import { Controller, Body, UseGuards, Patch, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { UserDto } from './dto/user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { SuccessEnum } from 'src/shared/i18n/enums/success.enum';

@Controller()
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('/password')
  async updatePassword(
    @currentUser() user: IPayloud,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.userService.updatePassword(user.id, updatePasswordDto);
    return { message: SuccessEnum.PASSWORD_UPDATED };
  }

  @Get('/me')
  @Serialize(UserDto)
  async getMe(@currentUser() user: IPayloud) {
    return user;
  }
}
