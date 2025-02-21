import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Regulation } from './regulation.entity';

@Entity()
export class FacultyRequirements extends BaseEntity {
  @Column()
  mandatoryHours: number;

  @Column()
  optionalHours: number;

  @OneToOne(() => Regulation, (regulation) => regulation.facultyRequirements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  regulation: Regulation;
}
