import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { User } from '../user/entities/user.entity';
import { Student } from './entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Regulation } from '../regulation/entities';
import { PersonalInfo } from '../personal-info/entities/personal-info.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AcademicInfo } from '../academic-info/entities/academic-info.entity';
import { GetStudentsDto } from './dto/get-students.dto';
import { UUID } from 'crypto';
import { Role } from '../auth/entities/role.entity';
import { RoleEnum } from '../role/enums/role.enum';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Regulation)
    private readonly regulationRepo: Repository<Regulation>,
    @InjectRepository(PersonalInfo)
    private readonly personalInfoRepo: Repository<PersonalInfo>,
    @InjectRepository(AcademicInfo)
    private readonly academicInfoRepo: Repository<AcademicInfo>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const { email, nationalId, universityId, regulationId, phone } =
      createStudentDto;
    //check if the email in user
    if (await this.userRepo.existsBy({ email }))
      throw new ConflictException(ErrorEnum.EMAIL_IN_USE);

    //check if the nationalId in use
    if (await this.personalInfoRepo.existsBy({ nationalId }))
      throw new ConflictException(ErrorEnum.NATIONAL_ID_IN_USE);

    //check if the universityId in use
    if (await this.personalInfoRepo.existsBy({ universityId }))
      throw new ConflictException(ErrorEnum.UNIVERSITY_ID_IN_USE);

    //check if the phone in use
    if (await this.personalInfoRepo.existsBy({ phone }))
      throw new ConflictException(ErrorEnum.PHONE_IN_USE);

    //check if the regulation is exist
    const regulation = await this.regulationRepo.findOne({
      where: { id: regulationId },
    });
    if (!regulation) throw new NotFoundException(ErrorEnum.REGULATION_NOT_FOUND);

    //hash the password
    createStudentDto.password = await bcrypt.hash(
      createStudentDto.password,
      12,
    );

    const role = await this.roleRepo.findOne({
      where: { name: RoleEnum.STUDENT },
    });
    //create the user
    const user = await this.userRepo.save(
      this.userRepo.create({
        email,
        password: createStudentDto.password,
        role,
      }),
    );

    //create the student
    const student = await this.studentRepo.save(
      this.studentRepo.create({ user }),
    );

    //create the personalInfo of the student
    const personalInfo = await this.personalInfoRepo.save(
      this.personalInfoRepo.create({
        studentId: student.userId,
        ...createStudentDto,
      }),
    );

    //create the academicInfo of the stundent
    const AcademicInfo = await this.academicInfoRepo.save(
      this.academicInfoRepo.create({
        studentId: student.userId,
        regulation,
      }),
    );
    return student;
  }

  async findAll(getStudentsDto: GetStudentsDto) {
    const { page, limit, search = '' } = getStudentsDto;

    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.student', 'student')
      .innerJoin('student.personalInfo', 'personalInfo')
      .select([
        'user.id AS id',
        'personalInfo.name AS name',
        'personalInfo.avatar AS avatar',
      ])
      .where(
        `LOWER(personalInfo.name->>'$.en') LIKE LOWER(:search) OR 
         LOWER(personalInfo.name->>'$.ar') LIKE LOWER(:search)`,
        { search: `%${search}%` },
      );

    const students = await queryBuilder
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    const total = await queryBuilder.getCount();

    return {
      data: students,
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(id: UUID) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);
    return this.userRepo.remove(user);
  }
}
