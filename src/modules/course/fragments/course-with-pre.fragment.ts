export const getCourseWithPreFragment = (
  courseAlias: string,
  preAlias: string,
) => `
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'id', ${courseAlias}.id,
      'name', ${courseAlias}.name,
      'code', ${courseAlias}.code,
      'lectureHours', ${courseAlias}.lectureHours,
      'practicalHours', ${courseAlias}.practicalHours,
      'creditHours', ${courseAlias}.creditHours,
      'level', ${courseAlias}.level,
      'prerequisite', 
      CASE 
        WHEN ${preAlias}.id IS NOT NULL THEN 
          JSON_OBJECT(
            'id', ${preAlias}.id,
            'name', ${preAlias}.name,
            'code', ${preAlias}.code
          )
        ELSE NULL 
      END
    )
  ) AS courses
`;
