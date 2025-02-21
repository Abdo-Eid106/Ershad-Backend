import { Module } from '@nestjs/common';
import { PersonalInfoService } from './personal-info.service';
import { PersonalInfoController } from './personal-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalInfo } from './entities/personal-info.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalInfo, User])],
  controllers: [PersonalInfoController],
  providers: [PersonalInfoService],
})
export class PersonalInfoModule {}
