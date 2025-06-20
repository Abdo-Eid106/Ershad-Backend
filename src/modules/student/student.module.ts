import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Student } from './entities/student.entity';
import { Regulation } from '../regulation/entities';
import { PersonalInfo } from '../personal-info/entities/personal-info.entity';
import { AcademicInfo } from '../academic-info/entities/academic-info.entity';
import { Role } from '../auth/entities/role.entity';
import { StudentRepo } from './repos/student.repo';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Student,
      Regulation,
      PersonalInfo,
      AcademicInfo,
      Role,
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService, StudentRepo],
})
export class StudentModule {}
