import type { Interfaces } from '../shared';

import { BaseDependencyBuilder } from './base-dependency-builder';

export class UseValueDependencyBuilder extends BaseDependencyBuilder {

  static create (
    useValueDependency: Interfaces.UseValueDependency,
  ): UseValueDependencyBuilder {
    const inst = new UseValueDependencyBuilder(useValueDependency);
    return inst;
  }

  constructor (
    private useValueDependency: Interfaces.UseValueDependency,
  ) {
    super();
  }

  /**
   * Returns the value of dependency without any transformations.
   *
   * @return {Promise<any>}
   */
  async create (
  ): Promise<any> {
    return this.useValueDependency.useValue;
  }
}
