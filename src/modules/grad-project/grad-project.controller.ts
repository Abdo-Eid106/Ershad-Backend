import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GradProjectService } from './grad-project.service';
import { UUID } from 'crypto';
import { CreateCourseDto } from '../course/dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { CourseDto } from '../course/dto/course.dto';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';

@UseGuards(JwtGuard, RolesGuard)
@Controller('programs/:programId/grad-project')
@Serialize(CourseDto)
export class GradProjectController {
  constructor(private readonly gradProjectService: GradProjectService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  create(
    @Param('programId', ParseUUIDPipe) programId: UUID,
    @Body() createGradProjectDto: CreateCourseDto,
  ) {
    return this.gradProjectService.create(programId, createGradProjectDto);
  }

  @Get()
  findOne(@Param('programId') programId: UUID) {
    return this.gradProjectService.findOne(programId);
  }

  @Put()
  @Roles(RoleEnum.ADMIN)
  update(
    @Param('programId', ParseUUIDPipe) programId: UUID,
    @Body() updateGradProjectDto: CreateCourseDto,
  ) {
    return this.gradProjectService.update(programId, updateGradProjectDto);
  }
}
