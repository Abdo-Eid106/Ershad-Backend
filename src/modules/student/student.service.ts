import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Regulation } from '../regulation/entities';
import { PersonalInfo } from '../personal-info/entities/personal-info.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AcademicInfo } from '../academic-info/entities/academic-info.entity';
import { GetStudentsDto } from './dto/get-students.dto';
import { Role } from '../auth/entities/role.entity';
import { RoleEnum } from '../role/enums/role.enum';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { StudentRepo } from './repos/student.repo';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Regulation)
    private readonly regulationRepo: Repository<Regulation>,
    @InjectRepository(PersonalInfo)
    private readonly personalInfoRepo: Repository<PersonalInfo>,
    @InjectRepository(AcademicInfo)
    private readonly academicInfoRepo: Repository<AcademicInfo>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly studentRepo: StudentRepo,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const { email, nationalId, universityId, regulationId, phone } =
      createStudentDto;
    if (await this.userRepo.existsBy({ email }))
      throw new ConflictException(ErrorEnum.EMAIL_IN_USE);

    if (await this.personalInfoRepo.existsBy({ nationalId }))
      throw new ConflictException(ErrorEnum.NATIONAL_ID_IN_USE);

    if (await this.personalInfoRepo.existsBy({ universityId }))
      throw new ConflictException(ErrorEnum.UNIVERSITY_ID_IN_USE);

    if (await this.personalInfoRepo.existsBy({ phone }))
      throw new ConflictException(ErrorEnum.PHONE_IN_USE);

    const regulation = await this.regulationRepo.findOne({
      where: { id: regulationId },
    });
    if (!regulation)
      throw new NotFoundException(ErrorEnum.REGULATION_NOT_FOUND);

    createStudentDto.password = await bcrypt.hash(
      createStudentDto.password,
      12,
    );

    const role = await this.roleRepo.findOne({
      where: { name: RoleEnum.STUDENT },
    });
    const user = await this.userRepo.save(
      this.userRepo.create({
        email,
        password: createStudentDto.password,
        role,
      }),
    );

    const student = await this.studentRepo.save(
      this.studentRepo.create({ user }),
    );

    await this.personalInfoRepo.save(
      this.personalInfoRepo.create({
        studentId: student.userId,
        ...createStudentDto,
      }),
    );

    await this.academicInfoRepo.save(
      this.academicInfoRepo.create({
        studentId: student.userId,
        regulation,
      }),
    );
    return student;
  }

  async findAll(getStudentsDto: GetStudentsDto) {
    const { page, limit, search = '' } = getStudentsDto;
    return this.studentRepo.findPaginatedFiltered(page, limit, search);
  }

  async remove(id: User['id']) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);
    return this.userRepo.remove(user);
  }
}
