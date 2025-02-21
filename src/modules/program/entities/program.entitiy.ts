import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Regulation } from 'src/modules/regulation/entities';
import { Plan } from 'src/modules/plan/entities/plan.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { RequirementCourse } from 'src/modules/requirement/entities/requirement-course.entity';

@Entity()
export class Program extends BaseEntity {
  @Column({ type: 'json' })
  name: { en: string; ar: string };

  @Column()
  code: string;

  @Column()
  degree: string;

  @ManyToOne(() => Regulation, (regulation) => regulation.programs, {
    onDelete: 'CASCADE',
  })
  regulation: Regulation;

  @OneToOne(() => Plan, (plan) => plan.program)
  plan: Plan;

  @OneToMany(
    () => RequirementCourse,
    (requirementCourse) => requirementCourse.program,
  )
  requirementCourses: RequirementCourse[];
}
