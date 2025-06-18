import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warning } from './entities/warning.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class WarningService {
  constructor(
    @InjectRepository(Warning)
    private readonly warningRepo: Repository<Warning>,
  ) {}

  async getStudentWarnings(studentId: User['id']) {
    const warnings = await this.warningRepo.find({
      where: { semester: { academicInfo: { studentId } } },
      order: { semester: { startYear: 'ASC', semester: 'ASC' } },
      relations: ['semester'],
    });

    return warnings;
  }
}
