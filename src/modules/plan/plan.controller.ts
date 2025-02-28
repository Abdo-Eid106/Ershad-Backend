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
import { UUID } from 'crypto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { SemesterPlanDto } from './dto/semester-plan.dto';

@Controller('programs/:programId/plans')
@UseGuards(JwtGuard, RolesGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  create(
    @Param('programId', ParseUUIDPipe) programId: UUID,
    @Body() CreatePlanDto: CreatePlanDto,
  ) {
    return this.planService.create(programId, CreatePlanDto);
  }

  @Get()
  @Serialize(SemesterPlanDto)
  findOne(@Param('programId', ParseUUIDPipe) programId: UUID) {
    return this.planService.findOne(programId);
  }

  @Put()
  @Roles(RoleEnum.ADMIN)
  update(
    @Param('programId', ParseUUIDPipe) programId: UUID,
    @Body() updatePlanDto: CreatePlanDto,
  ) {
    return this.planService.update(programId, updatePlanDto);
  }
}
