import { InjectRepository } from '@nestjs/typeorm';
import { Officer } from './entities/officer.entity';
import { Repository } from 'typeorm';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { User } from '../user/entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { Role } from '../auth/entities/role.entity';
import { RoleEnum } from '../role/enums/role.enum';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

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
      throw new ConflictException(ErrorEnum.EMAIL_IN_USE);

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

  async remove(id: User['id']) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(ErrorEnum.OFFICER_NOT_FOUND);
    return this.userRepo.remove(user);
  }
}
