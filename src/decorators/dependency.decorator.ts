import { Interfaces } from '../shared';
import { Helper } from '../shared';

export function Dependency (
  config?: Interfaces.DependencyConfig,
): ClassDecorator {
  return (target) => {
    Helper.setDependencyConfig(config, target);
  };
}
