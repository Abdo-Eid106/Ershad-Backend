export function clearMinutes(date: Date) {
  const newDate = new Date(date);
  newDate.setMinutes(0, 0, 0);
  return newDate;
}
