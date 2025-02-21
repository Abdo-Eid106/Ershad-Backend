import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SpecializationRequirements } from './specialization-requirements';
import { BaseEntity } from 'src/shared/entities/Base.entity';

@Entity()
export class GradProjectRequirements extends BaseEntity {
  @Column()
  requiredHours: number;

  @Column()
  creditHours: number;

  @OneToOne(
    () => SpecializationRequirements,
    (specialization) => specialization.gradProjectRequirements,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  specializationRequirements: SpecializationRequirements;
}
