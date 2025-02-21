import { InjectRepository } from '@nestjs/typeorm';
import { Officer } from './entities/officer.entity';
import { Repository } from 'typeorm';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { User } from '../user/entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { UUID } from 'crypto';
import { Role } from '../auth/entities/role.entity';
import { RoleEnum } from '../role/enums/role.enum';

export class OfficerService {
  constructor(
    @InjectRepository(Officer)
    private readonly officerRepo: Repository<Officer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async create(createOfficerDto: CreateOfficerDto) {
    const { email } = createOfficerDto;

    if (await this.userRepo.existsBy({ email }))
      throw new ConflictException('email in use');

    const password = await hash(createOfficerDto.password, 12);
    const role = await this.roleRepo.findOne({
      where: { name: RoleEnum.OFFICER },
    });
    const user = await this.userRepo.save(
      this.userRepo.create({
        email,
        password,
        role,
      }),
    );

    return this.officerRepo.save(
      this.officerRepo.create({ user, name: createOfficerDto.name }),
    );
  }

  async findAll() {
    return this.officerRepo
      .createQueryBuilder('officer')
      .innerJoin('officer.user', 'user')
      .select(['user.id AS id', 'user.email AS email', 'officer.name AS name'])
      .getRawMany();
  }

  async remove(id: UUID) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('officer not found');
    return this.userRepo.remove(user);
  }
}
