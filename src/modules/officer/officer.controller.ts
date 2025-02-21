import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OfficerService } from './officer.service';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UUID } from 'crypto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { OfficerDto } from './dto/officer.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { RoleEnum } from '../role/enums/role.enum';
import { Roles } from '../role/decorators/roles.decorator';

@Controller('officers')
// @UseGuards(JwtGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
@Serialize(OfficerDto)
export class OfficerController {
  constructor(private readonly officerService: OfficerService) {}

  @Post()
  create(@Body() createOfficerDto: CreateOfficerDto) {
    return this.officerService.create(createOfficerDto);
  }

  @Get()
  findAll() {
    return this.officerService.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.officerService.remove(id);
  }
}
