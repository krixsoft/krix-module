import type { Interfaces } from '../shared';
import { Helper } from '../shared';

import { BaseDependencyBuilder } from './base-dependency-builder';

export class UseClassDependencyBuilder extends BaseDependencyBuilder {

  static create (
    useClassDependency: Interfaces.UseClassDependency,
  ): UseClassDependencyBuilder {
    const inst = new UseClassDependencyBuilder(useClassDependency);
    return inst;
  }

  constructor (
    private useClassDependency: Interfaces.UseClassDependency,
  ) {
    super();

    this.dependencyIsSingleton = useClassDependency?.singleton !== false;
  }

  /**
   * Creates a new instance of the UseClass dependency. If dependency list isn't empty, method will get all
   * dependencies for the UseClass instance. If external dependencies are provided they will be used instead
   * of creating of new dependencies.
   *
   * @param  {Interfaces.ExternalDependency[]} [extDeps]
   * @return {Promise<any>}
   */
  async create (
    extDeps?: Interfaces.ExternalDependency[],
  ): Promise<any> {
    // Get all dependencies for the UseClass instance
    const dependencyList = this.useClassDependency.dependencies;
    const constructorDepsInstsPr = (dependencyList ?? []).map(async (dependencyKey, dependencyIndex) => {
      const externalDependency = await this.getExternalDependency(dependencyKey, extDeps);
      if (Helper.isNil(externalDependency) === false) {
        return externalDependency;
      }

      const dependencyBuilder = this.dependencyBuilderStorage.getDependencyBuilder(dependencyKey);

      if (Helper.isNil(dependencyBuilder) === true) {
        throw new Error(`UseClass Dependency. Provided dependency not found! `
          + `Dependency: "${Helper.getDependencyName(this.useClassDependency.dependencyKey)}". `
          + `Index: ${dependencyIndex}. `
          + `Provided dependency: "${Helper.getDependencyName(dependencyKey)}".`);
      }

      const dependencyInst = await dependencyBuilder.get();
      return dependencyInst;
    });
    const constructorDepsInsts = await Promise.all(constructorDepsInstsPr);

    const useClassDependencyInst = new this.useClassDependency.useClass(...constructorDepsInsts);
    return useClassDependencyInst;
  }
}
