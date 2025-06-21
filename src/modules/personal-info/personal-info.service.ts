import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PersonalInfo } from './entities/personal-info.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { User } from '../user/entities/user.entity';
import { CloudinaryService } from 'src/shared/upload/cloudinary.service';
import { Student } from '../student/entities/student.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class PersonalInfoService {
  constructor(
    @InjectRepository(PersonalInfo)
    private readonly personalInfoRepo: Repository<PersonalInfo>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findOne(id: User['id']) {
    const student = await this.personalInfoRepo
      .createQueryBuilder('personalInfo')
      .innerJoin('personalInfo.student', 'student')
      .innerJoin('student.user', 'user')
      .select('user.id', 'id')
      .addSelect('user.email', 'email')
      .addSelect('personalInfo.name', 'name')
      .addSelect('personalInfo.nationalId', 'nationalId')
      .addSelect('personalInfo.universityId', 'universityId')
      .addSelect('personalInfo.gender', 'gender')
      .addSelect('personalInfo.phone', 'phone')
      .addSelect('personalInfo.avatar', 'avatar')
      .where('user.id = :id', { id })
      .getRawOne();

    if (!student) throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);
    return student;
  }

  async update(id: User['id'], updatePersonalInfoDto: UpdatePersonalInfoDto) {
    const { email, nationalId, universityId, phone } = updatePersonalInfoDto;

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);

    if (user.email != email && (await this.userRepo.existsBy({ email })))
      throw new ConflictException(ErrorEnum.EMAIL_IN_USE);

    const personalInfo = await this.personalInfoRepo.findOne({
      where: { studentId: id },
    });

    if (
      personalInfo.nationalId != nationalId &&
      (await this.personalInfoRepo.existsBy({ nationalId }))
    )
      throw new ConflictException(ErrorEnum.NATIONAL_ID_IN_USE);

    if (
      personalInfo.universityId != universityId &&
      (await this.personalInfoRepo.existsBy({ universityId }))
    )
      throw new ConflictException(ErrorEnum.UNIVERSITY_ID_IN_USE);

    if (
      personalInfo.phone != phone &&
      (await this.personalInfoRepo.existsBy({ phone }))
    )
      throw new ConflictException(ErrorEnum.PHONE_IN_USE);

    await this.userRepo.save({ ...user, ...updatePersonalInfoDto });

    await this.personalInfoRepo.save({
      ...personalInfo,
      ...updatePersonalInfoDto,
    });
  }

  async updateAvatar(studentId: User['id'], avatar: Express.Multer.File) {
    const personalInfo = await this.personalInfoRepo.findOne({
      where: { studentId },
    });
    if (!personalInfo) throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);

    const { secure_url } = await this.cloudinaryService.uploadMedia(
      avatar,
      'image',
    );
    return this.personalInfoRepo.save({ ...personalInfo, avatar: secure_url });
  }
}
