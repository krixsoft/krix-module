import { Interfaces } from '../shared';
import { Helper } from '../shared';

export function Inject (
  token: Interfaces.DependencyKey,
): any {
  return (target: any, propertyKey: string | symbol, paramIndex?: number) => {
    const diKey = token ?? Reflect.getMetadata('design:type', target, propertyKey);

    if (Helper.isNil(paramIndex) === true) {
      Helper.setDependencyClassProperty(diKey, target.constructor, propertyKey);
      return;
    }

    if (Helper.isNil(diKey) === true) {
      throw new Error(`${target.name} (${paramIndex} -> ${String(token)}). DI Key is required.`);
    }

    Helper.setDependencyConstructorParameters(diKey, target, paramIndex);
  };
}
