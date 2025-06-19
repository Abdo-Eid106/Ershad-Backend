import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { OnModuleInit } from '@nestjs/common';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../auth/entities/role.entity';
import { RoleEnum } from '../role/enums/role.enum';

export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    let password = this.configService.get<string>('ADMIN_PASSWORD');

    const adminExist = await this.userRepo.existsBy({ email });
    if (adminExist) return;

    password = await hash(password, 12);

    let role = await this.roleRepo.findOne({
      where: { name: RoleEnum.ADMIN },
    });
    if (!role) {
      role = await this.roleRepo.save(
        this.roleRepo.create({ name: RoleEnum.ADMIN }),
      );
    }

    const user = await this.userRepo.save(
      this.userRepo.create({
        email,
        password,
        role,
      }),
    );

    return this.adminRepo.save(
      this.adminRepo.create({ user, name: { en: 'admin', ar: 'ادمن' } }),
    );
  }
}
