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

@Controller('regulations')
// @UseGuards(JwtGuard, RolesGuard)
export class RegulationController {
  constructor(private readonly regulationService: RegulationService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  async create(@Body() createRegulationDto: CreateRegulationDto) {
    return this.regulationService.create(createRegulationDto);
  }

  @Get()
  findAll() {
    return this.regulationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.regulationService.findOne(id);
  }

  @Put(':id')
  @Roles(RoleEnum.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updateRegulationDto: CreateRegulationDto,
  ) {
    return this.regulationService.update(id, updateRegulationDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.regulationService.remove(id);
  }
}
