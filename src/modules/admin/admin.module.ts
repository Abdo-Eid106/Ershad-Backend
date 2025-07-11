import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../auth/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, User, Role])],
  providers: [AdminService],
})
export class AdminModule {}
