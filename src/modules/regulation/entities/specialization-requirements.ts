import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Regulation } from './regulation.entity';
import { GradProjectRequirements } from './graduation-project-requirements.entity';
import { TrainingRequirements } from './training-requirements.entity';

@Entity()
export class SpecializationRequirements extends BaseEntity {
  @Column()
  requiredHours: number;

  @Column()
  mandatoryHours: number;

  @Column()
  optionalHours: number;

  @OneToOne(
    () => Regulation,
    (regulation) => regulation.specializationRequirements,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  regulation: Regulation;

  @OneToOne(
    () => GradProjectRequirements,
    (gradProjectRequirements) =>
      gradProjectRequirements.specializationRequirements,
  )
  gradProjectRequirements: GradProjectRequirements;

  @OneToOne(
    () => TrainingRequirements,
    (trainingRequirements) => trainingRequirements.specializationRequirements,
  )
  trainingRequirements: TrainingRequirements;
}
