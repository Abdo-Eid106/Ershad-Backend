import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AcademicInfoService } from './academic-info.service';
import { UUID } from 'crypto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { AcademicInfoDto } from './dto/academic-info.dto';
import { UpdateAcademicInfoDto } from './dto/update-academic-info.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
export class AcademicInfoController {
  constructor(private readonly academicInfoService: AcademicInfoService) {}

  @Get('students/:id/academic-info')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  @Serialize(AcademicInfoDto)
  get(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.academicInfoService.getAcademicInfo(id);
  }

  @Get('academic-info/me')
  @Roles(RoleEnum.STUDENT)
  @Serialize(AcademicInfoDto)
  getMyAcademicInfo(@currentUser() user: IPayloud) {
    return this.academicInfoService.getAcademicInfo(user.id);
  }

  @Put('students/:id/academic-info')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updateAcademicInfoDto: UpdateAcademicInfoDto,
  ) {
    return this.academicInfoService.update(id, updateAcademicInfoDto);
  }
}
