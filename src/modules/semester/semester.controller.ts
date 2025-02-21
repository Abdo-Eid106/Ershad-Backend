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
import { UUID } from 'crypto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';

@Controller()
// @UseGuards(JwtGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post('/students/:id/semesters')
  create(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() createSemesterDto: CreateSemesterDto,
  ) {
    return this.semesterService.create(id, createSemesterDto);
  }

  @Get('/students/:id/semesters')
  @Serialize(SemestersDto)
  findStudentSemesters(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.semesterService.findStudentSemesters(id);
  }

  @Get('/semesters/:id')
  @Serialize(SemesterDto)
  findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.semesterService.findOne(id);
  }

  @Put('/semesters/:id')
  update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ) {
    return this.semesterService.update(id, updateSemesterDto);
  }

  @Delete('/semesters/:id')
  remove(@Param('id') id: UUID) {
    return this.semesterService.remove(id);
  }
}
