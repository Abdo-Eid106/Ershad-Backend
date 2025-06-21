import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SemesterService } from './semester.service';
import { CreateSemesterDto, SemesterDto } from './dto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { User } from '../user/entities/user.entity';
import { SuccessEnum } from 'src/shared/i18n/enums/success.enum';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
@Serialize(SemesterDto)
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post('/students/:id/semesters')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  async create(
    @Param('id', ParseUUIDPipe) id: User['id'],
    @Body() createSemesterDto: CreateSemesterDto,
  ) {
    await this.semesterService.create(id, createSemesterDto);
    return { message: SuccessEnum.SEMESTER_CREATED };
  }

  @Get('/students/:id/semesters')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  findStudentSemesters(@Param('id', ParseUUIDPipe) id: User['id']) {
    return this.semesterService.findStudentSemesters(id);
  }

  @Get('/me/semesters')
  @Roles(RoleEnum.STUDENT)
  findMySemesters(@currentUser() user: IPayloud) {
    return this.semesterService.findStudentSemesters(user.id);
  }

  @Get('/semesters/:id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  findOne(@Param('id', ParseUUIDPipe) id: User['id']) {
    return this.semesterService.findOne(id);
  }

  @Delete('/semesters/:id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  remove(@Param('id') id: User['id']) {
    return this.semesterService.remove(id);
  }
}
