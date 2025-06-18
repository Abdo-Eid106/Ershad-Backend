import { ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warning } from './entities/warning.entity';
import { Semester } from '../semester/entities/semester.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { SemesterService } from '../semester/semester.service';
import { QueuesEnum } from 'src/shared/queue/queues.enum';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Student } from '../student/entities/student.entity';

@Processor(QueuesEnum.WARNINGS)
export class WarningConsumer extends WorkerHost {
  private readonly logger = new Logger(WarningConsumer.name);

  constructor(
    @InjectRepository(Warning)
    private readonly warningRepo: Repository<Warning>,
    private readonly academicInfoService: AcademicInfoService,
    private readonly semesterService: SemesterService,
  ) {
    super();
  }

  async process(
    job: Job<{ semesterId: Semester['id']; studentId: Student['userId'] }>,
  ) {
    const { semesterId, studentId } = job.data;
    const { cumGpa } = (await this.semesterService.findOne(semesterId))
      .statistics;

    const minGpaToGraduate =
      await this.academicInfoService.getMinGpaToGraduate(studentId);
    if (cumGpa >= minGpaToGraduate) return;

    const doesWarningExist = await this.warningRepo.existsBy({
      semester: { id: semesterId },
    });
    if (doesWarningExist) throw new ConflictException(ErrorEnum.WARNING_EXIST);

    const warning = this.warningRepo.create({
      semester: { id: semesterId },
      gpa: cumGpa,
    });
    return this.warningRepo.save(warning);
  }

  @OnWorkerEvent('progress')
  onJobProgress(job: Job, progress: number) {
    this.logger.log(`[${job.id}] Progress: ${progress}%`);
  }

  @OnWorkerEvent('completed')
  async onJobComplete(job: Job) {
    this.logger.log(`[${job.id}] Completed successfully`);
  }

  @OnWorkerEvent('failed')
  onJobFail(job: Job, error: Error) {
    this.logger.error(`[${job.id}] Failed: ${error.message}`);
  }
}
