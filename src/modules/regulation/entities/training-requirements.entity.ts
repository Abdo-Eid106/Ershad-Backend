import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SpecializationRequirements } from './specialization-requirements';
import { BaseEntity } from 'src/shared/entities/Base.entity';

@Entity()
export class TrainingRequirements extends BaseEntity {
  @Column()
  requiredHours: number;

  @Column()
  creditHours: number;

  @OneToOne(
    () => SpecializationRequirements,
    (specialization) => specialization.trainingRequirements,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  specializationRequirements: SpecializationRequirements;
}
