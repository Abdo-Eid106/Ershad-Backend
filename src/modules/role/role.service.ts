import { Injectable, OnModuleInit } from '@nestjs/common';
import { Role } from '../auth/entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEnum } from './enums/role.enum';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async onModuleInit() {
    return await Promise.all([
      Object.values(RoleEnum).map(async (role) => {
        if (!(await this.roleRepo.existsBy({ name: role })))
          return await this.roleRepo.save(this.roleRepo.create({ name: role }));
      }),
    ]);
  }
}
