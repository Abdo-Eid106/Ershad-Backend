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
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { Program } from '../program/entities/program.entitiy';
import { PlanDto } from './dto/plan.dto';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('programs/:programId/plan')
  @Roles(RoleEnum.ADMIN)
  create(
    @Param('programId', ParseUUIDPipe) programId: Program['id'],
    @Body() CreatePlanDto: CreatePlanDto,
  ) {
    return this.planService.create(programId, CreatePlanDto);
  }

  @Serialize(PlanDto)
  @Get('programs/:programId/plan')
  findOne(@Param('programId', ParseUUIDPipe) programId: Program['id']) {
    return this.planService.findOne(programId);
  }

  @Put('programs/:programId/plan')
  @Roles(RoleEnum.ADMIN)
  update(
    @Param('programId', ParseUUIDPipe) programId: Program['id'],
    @Body() updatePlanDto: CreatePlanDto,
  ) {
    return this.planService.update(programId, updatePlanDto);
  }

  @Roles(RoleEnum.STUDENT)
  @Serialize(PlanDto)
  @Get('/me/plan')
  getMyPlan(@currentUser() user: IPayloud) {
    return this.planService.getStudentPlan(user.id);
  }
}
