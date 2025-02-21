import { Controller, Get, UseGuards } from '@nestjs/common';
import { RegisterationService } from './registeration.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
@Roles(RoleEnum.STUDENT)
export class RegisterationController {
  constructor(private readonly registerationService: RegisterationService) {}

  @Get('/prediction')
  async getPredciton(@currentUser() user: IPayloud) {
    return this.registerationService.getPrediction(user.id);
  }
}
