import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entitiy';
import { Regulation } from '../regulation/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Regulation])],
  controllers: [ProgramController],
  providers: [ProgramService],
})
export class ProgramModule {}
