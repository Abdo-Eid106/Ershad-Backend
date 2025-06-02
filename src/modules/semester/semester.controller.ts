import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SemesterService } from './semester.service';
import {
  CreateSemesterDto,
  UpdateSemesterDto,
  SemestersDto,
  SemesterDto,
} from './dto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { User } from '../user/entities/user.entity';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post('/students/:id/semesters')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  create(
    @Param('id', ParseUUIDPipe) id: User['id'],
    @Body() createSemesterDto: CreateSemesterDto,
  ) {
    return this.semesterService.create(id, createSemesterDto);
  }

  @Get('/students/:id/semesters')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  @Serialize(SemestersDto)
  findStudentSemesters(@Param('id', ParseUUIDPipe) id: User['id']) {
    return this.semesterService.findStudentSemesters(id);
  }

  @Get('/semesters/me')
  @Serialize(SemestersDto)
  @Roles(RoleEnum.STUDENT)
  findMySemesters(@currentUser() user: IPayloud) {
    return this.semesterService.findStudentSemesters(user.id);
  }

  @Get('/semesters/:id')
  @Serialize(SemesterDto)
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  findOne(@Param('id', ParseUUIDPipe) id: User['id']) {
    return this.semesterService.findOne(id);
  }

  @Put('/semesters/:id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  update(
    @Param('id', ParseUUIDPipe) id: User['id'],
    @Body() updateSemesterDto: UpdateSemesterDto,
  ) {
    return this.semesterService.update(id, updateSemesterDto);
  }

  @Delete('/semesters/:id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  remove(@Param('id') id: User['id']) {
    return this.semesterService.remove(id);
  }
}
