import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PersonalInfoService } from './personal-info.service';
import { UUID } from 'crypto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { PersonalInfoDto } from './dto/personal-info.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';

@Controller('/students/:id/personal-info')
// @UseGuards(JwtGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
@Serialize(PersonalInfoDto)
export class PersonalInfoController {
  constructor(private readonly personalInfoService: PersonalInfoService) {}

  @Get()
  findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.personalInfoService.findOne(id);
  }

  @Put()
  update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updatePersonalInfoDto: UpdatePersonalInfoDto,
  ) {
    return this.personalInfoService.update(id, updatePersonalInfoDto);
  }
}
