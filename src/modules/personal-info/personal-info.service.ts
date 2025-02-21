import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PersonalInfo } from './entities/personal-info.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PersonalInfoService {
  constructor(
    @InjectRepository(PersonalInfo)
    private readonly personalInfoRepo: Repository<PersonalInfo>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOne(id: UUID) {
    const student = await this.personalInfoRepo
      .createQueryBuilder('PI')
      .innerJoin('PI.student', 'student')
      .innerJoin('student.user', 'user')
      .select([
        'user.id AS id',
        'PI.name AS name',
        'PI.nationalId AS nationalId',
        'PI.universityId AS universityId',
        'PI.gender AS gender',
        'PI.phone AS phone',
        'user.email AS email',
      ])
      .where('user.id = :id', { id })
      .getRawOne();
    if (!student) throw new NotFoundException('student not found');
    return student;
  }

  async update(id: UUID, updatePersonalInfoDto: UpdatePersonalInfoDto) {
    const { email, nationalId, universityId, phone } = updatePersonalInfoDto;
    //check if the user exist
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('student not found');

    //check if the email in user
    if (user.email != email && (await this.userRepo.existsBy({ email })))
      throw new ConflictException('email in use');

    const personalInfo = await this.personalInfoRepo.findOne({
      where: { studentId: id },
    });

    //check if the nationalId in use
    if (
      personalInfo.nationalId != nationalId &&
      (await this.personalInfoRepo.existsBy({ nationalId }))
    )
      throw new ConflictException('nationalId in use');

    //check if the universityId in use
    if (
      personalInfo.universityId != universityId &&
      (await this.personalInfoRepo.existsBy({ universityId }))
    )
      throw new ConflictException('universityId in use');

    //check if the phone in use
    if (
      personalInfo.phone != phone &&
      (await this.personalInfoRepo.existsBy({ phone }))
    )
      throw new ConflictException('phone in use');

    //update user entity
    await this.userRepo.save({ ...user, ...updatePersonalInfoDto });

    //update personalInfo entity
    await this.personalInfoRepo.save({
      ...personalInfo,
      ...updatePersonalInfoDto,
    });

    return this.findOne(id);
  }
}
