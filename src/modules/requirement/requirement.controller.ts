import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { RequirementService } from './requirement.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { GetRequiremetsDto } from './dto/get-requirements.dto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { RequirementDto } from './dto/requirement.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { RoleEnum } from '../role/enums/role.enum';
import { Roles } from '../role/decorators/roles.decorator';
import { RequirementCourse } from './entities/requirement-course.entity';

@Controller('requirements')
@UseGuards(JwtGuard, RolesGuard)
@Serialize(RequirementDto)
export class RequirementController {
  constructor(private readonly requirementService: RequirementService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  create(@Body() createRequirementDto: CreateRequirementDto) {
    return this.requirementService.create(createRequirementDto);
  }

  @Get()
  findAll(@Query() getRequiremetsDto: GetRequiremetsDto) {
    return this.requirementService.findMany(getRequiremetsDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: RequirementCourse['id']) {
    return this.requirementService.remove(id);
  }
}
