import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Officer } from './entities/officer.entity';
import { User } from '../user/entities/user.entity';
import { OfficerController } from './officer.controller';
import { OfficerService } from './officer.service';
import { Role } from '../auth/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Officer, User, Role])],
  controllers: [OfficerController],
  providers: [OfficerService],
})
export class OfficerModule {}
