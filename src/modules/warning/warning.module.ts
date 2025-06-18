import { Module } from '@nestjs/common';
import { WarningService } from './warning.service';
import { WarningController } from './warning.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warning } from './entities/warning.entity';
import { AcademicInfoModule } from '../academic-info/academic-info.module';
import { WarningConsumer } from './warning.consumer';
import { SemesterModule } from '../semester/semester.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warning]),
    AcademicInfoModule,
    SemesterModule,
  ],
  providers: [WarningService, WarningConsumer],
  controllers: [WarningController],
})
export class WarningModule {}
