export function applyDecorators(decorators: Function[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    decorators.forEach((decorator) =>
      decorator(target, propertyKey, descriptor),
    );
  };
}
