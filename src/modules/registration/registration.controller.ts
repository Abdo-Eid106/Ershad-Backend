import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller('/registrations')
@UseGuards(JwtGuard, RolesGuard)
@Roles(RoleEnum.STUDENT)
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Get('/prediction')
  async getPredciton(@currentUser() user: IPayloud) {
    return this.registrationService.getPrediction(user.id);
  }

  @Post()
  async create(
    @currentUser() user: IPayloud,
    @Body() createRegistrationDto: CreateRegistrationDto,
  ) {
    await this.registrationService.create(user.id, createRegistrationDto);
    return { message: 'Registration completed successfully.' };
  }
}
