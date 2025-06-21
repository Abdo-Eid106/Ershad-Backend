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
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { AcademicInfoDto } from './dto/academic-info.dto';
import { UpdateAcademicInfoDto } from './dto/update-academic-info.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { User } from '../user/entities/user.entity';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
export class AcademicInfoController {
  constructor(private readonly academicInfoService: AcademicInfoService) {}

  @Get('students/:id/academic-info')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  @Serialize(AcademicInfoDto)
  get(@Param('id', ParseUUIDPipe) id: User['id']) {
    return this.academicInfoService.getAcademicInfo(id);
  }

  @Get('me/academic-info')
  @Roles(RoleEnum.STUDENT)
  @Serialize(AcademicInfoDto)
  getMyAcademicInfo(@currentUser() user: IPayloud) {
    return this.academicInfoService.getAcademicInfo(user.id);
  }

  @Put('students/:id/academic-info')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  update(
    @Param('id', ParseUUIDPipe) id: User['id'],
    @Body() updateAcademicInfoDto: UpdateAcademicInfoDto,
  ) {
    return this.academicInfoService.update(id, updateAcademicInfoDto);
  }
}
