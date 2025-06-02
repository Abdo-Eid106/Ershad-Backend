import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { User } from '../user/entities/user.entity';
import {
  ConflictException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
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

  async create(createAdminDto: CreateAdminDto) {
    const { email } = createAdminDto;

    if (await this.userRepo.existsBy({ email }))
      throw new ConflictException('email in use');

    const password = await hash(createAdminDto.password, 12);
    const role = await this.roleRepo.findOne({
      where: { name: RoleEnum.ADMIN },
    });
    const user = await this.userRepo.save(
      this.userRepo.create({
        email,
        password,
        role,
      }),
    );

    return this.adminRepo.save(
      this.adminRepo.create({ user, name: createAdminDto.name }),
    );
  }

  async findAll() {
    return this.adminRepo
      .createQueryBuilder('Admin')
      .innerJoin('Admin.user', 'user')
      .select(['user.id AS id', 'user.email AS email', 'Admin.name AS name'])
      .getRawMany();
  }

  async remove(id: User['id']) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Admin not found');
    return this.userRepo.remove(user);
  }

  async onModuleInit() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');

    if (!(await this.userRepo.existsBy({ email }))) {
      await this.create({
        email,
        password,
        name: { en: '', ar: '' },
      });
    }
  }
}
