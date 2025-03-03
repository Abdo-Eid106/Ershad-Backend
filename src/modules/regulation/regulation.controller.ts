import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RegulationService } from './regulation.service';
import { CreateRegulationDto } from './dto/create-regulation.dto';
import { UUID } from 'crypto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { RegulationDto } from './dto/regulation.dto';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
@Serialize(RegulationDto)
export class RegulationController {
  constructor(private readonly regulationService: RegulationService) {}

  @Post('regulations')
  @Roles(RoleEnum.ADMIN)
  async create(@Body() createRegulationDto: CreateRegulationDto) {
    return this.regulationService.create(createRegulationDto);
  }

  @Get('regulations')
  findAll() {
    return this.regulationService.findAll();
  }

  @Get('regulations/:id')
  findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.regulationService.findOne(id);
  }

  @Get('me/regulation')
  @Roles(RoleEnum.STUDENT)
  getMyregulation(@currentUser() user: IPayloud) {
    return this.regulationService.getStudentRegulation(user.id);
  }

  @Put('regulations/:id')
  @Roles(RoleEnum.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updateRegulationDto: CreateRegulationDto,
  ) {
    return this.regulationService.update(id, updateRegulationDto);
  }

  @HttpCode(204)
  @Delete('regulations/:id')
  @Roles(RoleEnum.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.regulationService.remove(id);
  }
}
