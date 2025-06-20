import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateRegulationDto,
  CreateLevelDto,
  CreateCourseGpaRange,
  CreateCumGpaRange,
} from './dto/create-regulation.dto';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class RegulationValidationService {
  validateRegulation(createRegulationDto: CreateRegulationDto) {
    this.validateLevels(
      createRegulationDto.levels,
      createRegulationDto.academicRequirements.levelsCount,
    );
    this.validateCourseGpaRange(createRegulationDto.courseGpaRanges);
    this.validateCumGpaRange(createRegulationDto.cumGpaRanges);
  }

  validateLevels(levels: CreateLevelDto[], levelsCount: number) {
    levels.sort((x, y) => x.value - y.value);
    if (levels.length !== levelsCount)
      throw new BadRequestException(ErrorEnum.LEVELS_RANGE_INVALID);
    levels.forEach((x, i) => {
      if (x.value !== i + 1)
        throw new BadRequestException(ErrorEnum.LEVELS_RANGE_INVALID);
      if (i > 0 && x.reqHours <= levels[i - 1].reqHours)
        throw new BadRequestException(ErrorEnum.LEVEL_REQ_HOURS_INVALID);
    });
  }

  validateCourseGpaRange(gpaRange: CreateCourseGpaRange[]) {
    gpaRange.sort((a, b) => a.from - b.from);

    let isValid = true;

    if (gpaRange[0]?.from !== 0 || gpaRange[gpaRange.length - 1]?.to !== 100) {
      isValid = false;
    }

    for (let i = 0; i < gpaRange.length - 1; i++) {
      const current = gpaRange[i];
      const next = gpaRange[i + 1];

      if (current.to < current.from) {
        isValid = false;
      }

      if (current.to + 1 !== next.from) {
        isValid = false;
      }

      if (current.gpa >= next.gpa) {
        isValid = false;
      }
    }

    if (!isValid) {
      throw new BadRequestException(ErrorEnum.COURSE_GPA_RANGE_INVALID);
    }
  }

  validateCumGpaRange(gpaRange: CreateCumGpaRange[]) {
    gpaRange.sort((a, b) => a.from - b.from);

    let isValid = true;
    if (gpaRange[0]?.from !== 0 || gpaRange[gpaRange.length - 1]?.to !== 4) {
      isValid = false;
    }

    for (let i = 0; i < gpaRange.length - 1; i++) {
      const current = gpaRange[i];
      const next = gpaRange[i + 1];

      if (current.to < current.from) {
        isValid = false;
      }

      if (current.to + 0.01 !== next.from) {
        isValid = false;
      }
    }

    if (!isValid) {
      throw new BadRequestException(ErrorEnum.CUM_GPA_RANGE_INVALID);
    }
  }
}
