import * as _ from 'lodash';

import type { Interfaces } from '../shared';

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

    this.dependencyIsSingleton = useClassDependency?.singletone !== false;
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
    const constructorDepsInstsPr = _.map(dependencyList, async (dependencyKey, dependencyIndex) => {
      const externalDependency = _.find(extDeps, [ 'dependencyKey', dependencyKey ]);
      if (_.isNil(externalDependency) === false) {
        return externalDependency.value;
      }

      const dependencyBuilder = this.dependencyBuilderStorage.getDependencyBuilder(dependencyKey);

      if (_.isNil(dependencyBuilder) === true) {
        throw new Error(`Dependency (${dependencyIndex}) not found!`);
      }

      const dependencyInst = await dependencyBuilder.get();
      return dependencyInst;
    });
    const constructorDepsInsts = await Promise.all(constructorDepsInstsPr);

    const useClassDependencyInst = new this.useClassDependency.useClass(...constructorDepsInsts);
    return useClassDependencyInst;
  }
}
