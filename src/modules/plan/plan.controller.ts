import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { SemesterPlanDto } from './dto/semester-plan.dto';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { Program } from '../program/entities/program.entitiy';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('programs/:programId/plans')
  @Roles(RoleEnum.ADMIN)
  create(
    @Param('programId', ParseUUIDPipe) programId: Program['id'],
    @Body() CreatePlanDto: CreatePlanDto,
  ) {
    return this.planService.create(programId, CreatePlanDto);
  }

  @Get('programs/:programId/plans')
  @Serialize(SemesterPlanDto)
  findOne(@Param('programId', ParseUUIDPipe) programId: Program['id']) {
    return this.planService.findOne(programId);
  }

  @Put('programs/:programId/plans')
  @Roles(RoleEnum.ADMIN)
  update(
    @Param('programId', ParseUUIDPipe) programId: Program['id'],
    @Body() updatePlanDto: CreatePlanDto,
  ) {
    return this.planService.update(programId, updatePlanDto);
  }

  @Roles(RoleEnum.STUDENT)
  @Get('/me/plan')
  getMyPlan(@currentUser() user: IPayloud) {
    return this.planService.getStudentPlan(user.id);
  }
}
