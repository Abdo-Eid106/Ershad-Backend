import { Controller, Get, UseGuards } from '@nestjs/common';
import { WarningService } from './warning.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { WarningDto } from './dto/warning.dto';

@Controller('warnings')
@UseGuards(JwtGuard, RolesGuard)
export class WarningController {
  constructor(private readonly warningService: WarningService) {}

  @Get()
  @Roles(RoleEnum.STUDENT)
  @Serialize(WarningDto)
  getMyWarnings(@currentUser() user: IPayloud) {
    return this.warningService.getStudentWarnings(user.id);
  }
}
