import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { CourseDto } from '../course/dto/course.dto';
import { UpdateRegistrationStatus } from './dto/update-registration-status.dto';
import { RegistrationSettingsDto } from './dto/registration-settings.dto';
import { SuccessEnum } from 'src/shared/i18n/enums/success.enum';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('/registrations')
  @Roles(RoleEnum.STUDENT)
  async create(
    @currentUser() user: IPayloud,
    @Body() createRegistrationDto: CreateRegistrationDto,
  ) {
    await this.registrationService.registerStudentCourses(
      user.id,
      createRegistrationDto,
    );
    return { message: SuccessEnum.REGISTRATION_COMPLETED };
  }

  @Patch('/registrations/status')
  @Roles(RoleEnum.ADMIN)
  async updateRegistrationStatus(
    @Body() updateRegistrationStatus: UpdateRegistrationStatus,
  ) {
    await this.registrationService.updateRegistrationStatus(
      updateRegistrationStatus,
    );
    return { message: SuccessEnum.REGISTRATION_SETTINGS_UPDATED };
  }

  @Get('/registrations/status')
  @Serialize(RegistrationSettingsDto)
  getRegistrationStatus() {
    return this.registrationService.getSettings();
  }

  @Get('/registrations/me')
  @Roles(RoleEnum.STUDENT)
  @Serialize(CourseDto)
  async getMyRegistration(@currentUser() user: IPayloud) {
    return this.registrationService.getStudentRegisteredCourses(user.id);
  }

  @Get('/available-courses')
  @Serialize(CourseDto)
  @Roles(RoleEnum.STUDENT)
  async getAvailableCourses(@currentUser() user: IPayloud) {
    return this.registrationService.getStudentAvailableCourses(user.id);
  }

  @Get('/recommended-courses')
  @Serialize(CourseDto)
  @Roles(RoleEnum.STUDENT)
  getRecommendedCourses(@currentUser() user: IPayloud) {
    return this.registrationService.getRecommenedCourses(user.id);
  }
}
