import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Program } from 'src/modules/program/entities/program.entitiy';
import { SemesterPlan } from './semester-plan.entity';
import { UUID } from 'crypto';

@Entity()
export class Plan {
  @PrimaryColumn('uuid')
  programId: UUID;

  @OneToOne(() => Program, (program) => program.plan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'programId' })
  program: Program;

  @OneToMany(() => SemesterPlan, (semesterPlan) => semesterPlan.plan)
  semesterPlans: SemesterPlan[];
}
