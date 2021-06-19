import * as _ from 'lodash';

import type { Interfaces } from '../shared';

import { BaseDependencyBuilder } from './base-dependency-builder';

export class UseExistingDependencyBuilder extends BaseDependencyBuilder {

  static create (
    useExistingDependency: Interfaces.UseExistingDependency,
  ): UseExistingDependencyBuilder {
    const inst = new UseExistingDependencyBuilder(useExistingDependency);
    return inst;
  }

  constructor (
    private useExistingDependency: Interfaces.UseExistingDependency,
  ) {
    super();

    this.dependencyIsSingleton = true;
  }

  /**
   * Gets the existing instance and returns it instead of the target dependency.
   *
   * @return {Promise<any>}
   */
  async create (
  ): Promise<any> {
    // Get the instance of real dependency.
    const useExistingDependencyBuilder = this.dependencyBuilderStorage
      .getDependencyBuilder(this.useExistingDependency.useExisting);

    if (_.isNil(useExistingDependencyBuilder) === true) {
      throw new Error(`Existing dependency not found!`);
    }

    const useExistingDependencyInst = await useExistingDependencyBuilder.get();
    return useExistingDependencyInst;
  }
}
