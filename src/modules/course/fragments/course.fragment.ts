export const getCourseFragment = (courseAlias: string) => `
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'id', ${courseAlias}.id,
      'name', ${courseAlias}.name,
      'code', ${courseAlias}.code,
      'lectureHours', ${courseAlias}.lectureHours,
      'practicalHours', ${courseAlias}.practicalHours,
      'creditHours', ${courseAlias}.creditHours,
      'level', ${courseAlias}.level
    )
  ) AS courses
`;
