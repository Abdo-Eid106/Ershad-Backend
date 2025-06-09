import { Semester } from 'src/modules/semester/entities/semester.entity';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Warning extends BaseEntity {
  @ManyToOne(() => Semester, (semester) => semester.warnings, {
    onDelete: 'CASCADE',
  })
  semester: Semester;

  @Column({ type: 'float' })
  gpa: number;
}
