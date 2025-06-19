export function safeInArray<T>(arr: T[] | undefined | null): T[] | [null] {
  return Array.isArray(arr) && arr.length > 0 ? arr : [null];
}
