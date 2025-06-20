import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../entities/student.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StudentRepo extends Repository<Student> {
  private readonly isPostgres: boolean;

  constructor(
    @InjectRepository(Student)
    repository: Repository<Student>,
    private readonly configService: ConfigService,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
    this.isPostgres = this.configService.get('DB_TYPE') === 'postgres';
  }

  async findPaginatedFiltered(
    page: number,
    limit: number,
    search: string = '',
  ) {
    const baseQuery = this.createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .innerJoin('student.personalInfo', 'personalInfo')
      .select([
        'user.id AS id',
        'personalInfo.name AS name',
        'personalInfo.avatar AS avatar',
      ]);

    if (search) {
      if (this.isPostgres) {
        baseQuery.where(
          `(LOWER(personalInfo.name::json->>'en') LIKE LOWER(:search) OR 
            LOWER(personalInfo.name::json->>'ar') LIKE LOWER(:search))`,
          { search: `%${search}%` },
        );
      } else {
        baseQuery.where(
          `(LOWER(JSON_UNQUOTE(JSON_EXTRACT(personalInfo.name, '$.en'))) LIKE LOWER(:search) OR 
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(personalInfo.name, '$.ar'))) LIKE LOWER(:search))`,
          { search: `%${search}%` },
        );
      }
    }

    const countQuery = baseQuery.clone();
    const [students, total] = await Promise.all([
      baseQuery
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany(),
      countQuery.getCount(),
    ]);

    return {
      data: students,
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
