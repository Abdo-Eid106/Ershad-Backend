import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ProgramService } from './program.service';
import {
  GetProgramsDto,
  CreateProgramDto,
  UpdateProgramDto,
  ProgramDto,
} from './dto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { UUID } from 'crypto';
import { Roles } from '../role/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { RoleEnum } from '../role/enums/role.enum';

@Controller('programs')
// @UseGuards(JwtGuard, RolesGuard)
@Serialize(ProgramDto)
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programService.create(createProgramDto);
  }

  @Get()
  findAll(@Query() query: GetProgramsDto) {
    return this.programService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.programService.findOne(id);
  }

  @Put(':id')
  @Roles(RoleEnum.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    return this.programService.update(id, updateProgramDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.programService.remove(id);
  }
}
