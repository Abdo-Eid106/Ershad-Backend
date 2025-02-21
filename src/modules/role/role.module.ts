import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../auth/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleService],
})
export class RoleModule {}
