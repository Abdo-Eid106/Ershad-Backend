import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateRegulationDto,
  CreateLevelDto,
  CreateCourseGpaRange,
  CreateCumGpaRange,
} from './dto/create-regulation.dto';

@Injectable()
export class RegulationValidationService {
  constructor() {}

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
      throw new BadRequestException('Levels should be from 1 to levelsCount');
    levels.forEach((x, i) => {
      if (x.value !== i + 1)
        throw new BadRequestException('Levels should be from 1 to levelsCount');
      if (i > 0 && x.reqHours <= levels[i - 1].reqHours)
        throw new BadRequestException(
          `Level ${x.value} reqHours (${x.reqHours}) must be greater than level ${levels[i - 1].value} reqHours (${levels[i - 1].reqHours}).`,
        );
    });
  }

  validateCourseGpaRange(gpaRange: CreateCourseGpaRange[]) {
    // Sort ranges by the 'from' value
    gpaRange.sort((a, b) => a.from - b.from);

    // Error flag
    let isValid = true;

    // Perform validation checks
    if (gpaRange[0]?.from !== 0 || gpaRange[gpaRange.length - 1]?.to !== 100) {
      isValid = false;
    }

    for (let i = 0; i < gpaRange.length - 1; i++) {
      const current = gpaRange[i];
      const next = gpaRange[i + 1];

      // Ensure "to" > "from"
      if (current.to <= current.from) {
        isValid = false;
      }

      // Ensure continuity between ranges
      if (current.to !== next.from - 1) {
        isValid = false;
      }
    }

    // Throw an exception if any validation fails
    if (!isValid) {
      throw new BadRequestException(
        'Course GPA ranges must cover all numbers from 0 to 100 without gaps or overlaps.',
      );
    }
  }

  validateCumGpaRange(gpaRange: CreateCumGpaRange[]) {
    gpaRange.sort((a, b) => a.from - b.from);

    // Error flag
    let isValid = true;
    // Perform validation checks
    if (gpaRange[0]?.from !== 0 || gpaRange[gpaRange.length - 1]?.to !== 4) {
      isValid = false;
    }

    for (let i = 0; i < gpaRange.length - 1; i++) {
      const current = gpaRange[i];
      const next = gpaRange[i + 1];

      // Ensure "to" > "from"
      if (current.to <= current.from) {
        isValid = false;
      }

      // Ensure continuity between ranges
      if (current.to !== next.from - 0.01) {
        isValid = false;
      }
    }

    // Throw an exception if any validation fails
    if (!isValid) {
      throw new BadRequestException(
        'Cumulative GPA ranges must cover all numbers from 0 to 4 without gaps or overlaps.',
      );
    }
  }
}
