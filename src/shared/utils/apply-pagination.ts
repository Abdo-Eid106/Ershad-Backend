export const applyPagination = (query: object) => {
  const where = { ...query };
  ['skip', 'take'].forEach((key) => {
    delete where[key];
  });

  const res = { where };
  if ('skip' in query) {
    res['skip'] = parseInt(query['skip'] as string);
    res['take'] = parseInt(query['take'] as string);
  }
  return res;
};
