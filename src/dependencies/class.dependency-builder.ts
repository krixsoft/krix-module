import * as _ from 'lodash';

import type { Interfaces } from '../shared';
import { Helper } from '../shared';

import { BaseDependencyBuilder } from './base-dependency-builder';

export class ClassDependencyBuilder extends BaseDependencyBuilder {
  private config: Interfaces.DependencyConfig;
  private classDescriptor: Interfaces.ClassDescriptor;

  static create (
    classDependency: Interfaces.ClassDependency,
  ): ClassDependencyBuilder {
    const inst = new ClassDependencyBuilder(classDependency);
    return inst;
  }

  constructor (
    private classDependency: Interfaces.ClassDependency,
  ) {
    super();

    this.config = Helper.getDependencyConfig(classDependency);
    this.dependencyIsSingleton = this.config?.singletone === true;

    this.classDescriptor = Helper.getClassDescriptor(classDependency);
  }

  /**
   * Creates a new instance of the Class dependency. Gets all dependencies for for constructor and props
   * and use them to build the instance of the Class dependency.
   *
   * @return {Promise<any>}
   */
  async create (
  ): Promise<any> {
    // Get all dependencies for the class instance
    const constructorDeps = this.classDescriptor.constructorDeps;
    const constructorDepsInstsPr = _.map(constructorDeps, async (dependencyKey, dependencyIndex) => {
      const dependencyBuilder = this.dependencyBuilderStorage.getDependencyBuilder(dependencyKey);

      if (_.isNil(dependencyBuilder) === true) {
        console.log(this.classDependency, dependencyKey);
        throw new Error(`Constructor dependency (${dependencyIndex}) not found!`);
      }

      const dependencyInst = await dependencyBuilder.get();
      return dependencyInst;
    });
    const constructorDepsInsts = await Promise.all(constructorDepsInstsPr);

    // Build a new class instance
    const classDependencyInst = new this.classDependency(...constructorDepsInsts);

    // Get all dependencies for the instance properties and set them to the class instance
    const propsDepsPr = _.map(this.classDescriptor.propsDeps, async (properyDependency) => {
      const dependencyBuilder = this.dependencyBuilderStorage.getDependencyBuilder(properyDependency.dependencyKey);

      if (_.isNil(dependencyBuilder) === true) {
        throw new Error(`Property dependency (${String(properyDependency.propertyName)}) not found!`);
      }

      const dependencyInst = await dependencyBuilder.get();
      classDependencyInst[properyDependency.propertyName] = dependencyInst;
    });
    await Promise.all(propsDepsPr);

    return classDependencyInst;
  }
}
