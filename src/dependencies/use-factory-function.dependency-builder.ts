import * as _ from 'lodash';

import type { Interfaces } from '../shared';

import { BaseDependencyBuilder } from './base-dependency-builder';

export class UseFactoryFunctionDependencyBuilder extends BaseDependencyBuilder {

  static create (
    useFactoryFunctionDependency: Interfaces.UseFactoryFunctionDependency,
  ): UseFactoryFunctionDependencyBuilder {
    const inst = new UseFactoryFunctionDependencyBuilder(useFactoryFunctionDependency);
    return inst;
  }

  constructor (
    private useFactoryFunctionDependency: Interfaces.UseFactoryFunctionDependency,
  ) {
    super();

    this.dependencyIsSingleton = useFactoryFunctionDependency?.singletone === true;
  }

  /**
   * Calls the factory function to create an instance of the dependency. If `dependencies` property is defined, method
   * will get all dependencies from the dependency storage.
   *
   * @return {Promise<any>}
   */
  async create (
  ): Promise<any> {
    // Get all dependencies for the factory function
    const dependencyList = this.useFactoryFunctionDependency.dependencies;
    const functionDepsInstsPr = _.map(dependencyList, async (dependencyKey) => {
      const dependencyBuilder = this.dependencyBuilderStorage.getDependencyBuilder(dependencyKey);

      if (_.isNil(dependencyBuilder) === true) {
        throw new Error(`Factory dependency not found!`);
      }

      const dependencyInst = await dependencyBuilder.get();
      return dependencyInst;
    });
    const functionDepsInsts = await Promise.all(functionDepsInstsPr);

    // Build the instance of the dependency
    const useFactoryFunctionDependencyResult = await this.useFactoryFunctionDependency
      .useFactoryFunction(...functionDepsInsts);
    return useFactoryFunctionDependencyResult;
  }
}
