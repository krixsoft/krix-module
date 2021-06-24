import * as _ from 'lodash';

import { Interfaces } from '../shared';
import { Helper } from '../shared';

export function Inject (
  token: Interfaces.DependencyKey,
): any {
  return (target: any, propertyKey: string | symbol, paramIndex?: number) => {
    const diKey = token ?? Reflect.getMetadata('design:type', target, propertyKey);

    if (_.isUndefined(paramIndex) === true) {
      Helper.setDependencyClassProperty(diKey, target.constructor, propertyKey);
      return;
    }

    if (_.isNil(diKey)) {
      throw new Error(`${target.name} (${paramIndex} -> ${String(token)}). DI Key is required.`);
    }

    Helper.setDependencyConstructorParameters(diKey, target, paramIndex);
  };
}
