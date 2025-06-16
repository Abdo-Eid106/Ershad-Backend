import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FcmTokenService } from './fcm-token.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { CreateFcmToken } from './dto/create-fcm-token.dto';

@Controller('fcm-tokens')
@UseGuards(JwtGuard)
export class FcmTokenController {
  constructor(private readonly fcmTokenService: FcmTokenService) {}

  @Post()
  create(@currentUser() user: IPayloud, @Body() { token }: CreateFcmToken) {
    return this.fcmTokenService.create(user.id, token);
  }

  @Delete('/:token')
  remove(@currentUser() user: IPayloud, @Param('token') token: string) {
    return this.fcmTokenService.remove(user.id, token);
  }
}
