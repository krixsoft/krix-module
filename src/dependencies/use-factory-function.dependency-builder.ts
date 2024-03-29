import type { Interfaces } from '../shared';
import { Helper } from '../shared';

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

    this.dependencyIsSingleton = useFactoryFunctionDependency?.singleton !== false;
  }

  /**
   * Calls the factory function to create an instance of the dependency. If `dependencies` property is defined, method
   * will get all dependencies from the dependency storage. If external dependencies are provided, they will be used
   * instead of creating of new dependencies.
   *
   * @param  {Interfaces.ExternalDependency[]} [extDeps]
   * @return {Promise<any>}
   */
  async create (
    extDeps?: Interfaces.ExternalDependency[],
  ): Promise<any> {
    // Get all dependencies for the factory function
    const dependencyList = this.useFactoryFunctionDependency.dependencies;
    const functionDepsInstsPr = (dependencyList ?? []).map(async (dependencyKey, dependencyIndex) => {
      const externalDependency = await this.getExternalDependency(dependencyKey, extDeps);
      if (Helper.isNil(externalDependency) === false) {
        return externalDependency;
      }

      const dependencyBuilder = this.dependencyBuilderStorage.getDependencyBuilder(dependencyKey);

      if (Helper.isNil(dependencyBuilder) === true) {
        throw new Error(`UseFactoryFunction Dependency. Provided dependency not found! `
          + `Dependency: "${Helper.getDependencyName(this.useFactoryFunctionDependency.dependencyKey)}". `
          + `Index: ${dependencyIndex}. `
          + `Provided dependency: "${Helper.getDependencyName(dependencyKey)}".`);
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
