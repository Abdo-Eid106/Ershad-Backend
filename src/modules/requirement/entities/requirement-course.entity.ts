import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Course } from 'src/modules/course/entites/course.entity';
import { RequirementCategory } from '../enums/requirement-category.enum';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Regulation } from 'src/modules/regulation/entities';
import { Program } from 'src/modules/program/entities/program.entitiy';

@Entity()
export class RequirementCourse extends BaseEntity {
  @ManyToOne(() => Course, (course) => course.requirementCourses)
  course: Course;

  @Column({ type: 'enum', enum: RequirementCategory })
  category: RequirementCategory;

  @Column()
  optional: boolean;

  @ManyToOne(() => Regulation, (regulation) => regulation.requirementCourses, {
    onDelete: 'CASCADE',
  })
  regulation: Regulation;

  @ManyToOne(() => Program, (program) => program.requirementCourses, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  program?: Program;
}
