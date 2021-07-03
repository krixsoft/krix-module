import * as _ from 'lodash';

import type { Interfaces } from '../shared';
import { Helper } from '../shared';

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

    this.dependencyIsSingleton = false;
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
      throw new Error(`UseExisting Dependency. Existing dependency not found! `
        + `Dependency: "${Helper.getDependencyName(this.useExistingDependency.dependencyKey)}". `
        + `Existing dependency: "${Helper.getDependencyName(this.useExistingDependency.useExisting)}".`);
    }

    const useExistingDependencyInst = await useExistingDependencyBuilder.get();
    return useExistingDependencyInst;
  }
}
