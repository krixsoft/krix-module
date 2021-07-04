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
    this.dependencyIsSingleton = this.config?.singletone !== false;

    this.classDescriptor = Helper.getClassDescriptor(classDependency);
  }

  /**
   * Creates a new instance of the Class dependency. Gets all dependencies for for constructor and props
   * and use them to build the instance of the Class dependency. If external dependencies are provided,
   * they will be used instead of creating of new dependencies.
   *
   * @param  {Interfaces.ExternalDependency[]} [extDeps]
   * @return {Promise<any>}
   */
  async create (
    extDeps?: Interfaces.ExternalDependency[],
  ): Promise<any> {
    // Get all dependencies for the class instance
    const constructorDeps = this.classDescriptor.constructorDeps;
    const constructorDepsInstsPr = (constructorDeps ?? []).map(async (dependencyKey, dependencyIndex) => {
      const externalDependency = await this.getExternalDependency(dependencyKey, extDeps);
      if (Helper.isNil(externalDependency) === false) {
        return externalDependency;
      }
      const dependencyBuilder = this.dependencyBuilderStorage.getDependencyBuilder(dependencyKey);

      if (Helper.isNil(dependencyBuilder) === true) {
        throw new Error(`Class Dependency. Dependency in constructor not found! `
          + `Dependency: "${this.classDependency.name}". `
          + `Index: ${dependencyIndex}. `
          + `Provided dependency: "${Helper.getDependencyName(dependencyKey)}".`);
      }

      const dependencyInst = await dependencyBuilder.get();
      return dependencyInst;
    });
    const constructorDepsInsts = await Promise.all(constructorDepsInstsPr);

    // Build a new class instance
    const classDependencyInst = new this.classDependency(...constructorDepsInsts);

    // Get all dependencies for the instance properties and set them to the class instance
    const propsDepsPr = (this.classDescriptor.propsDeps ?? []).map(async (properyDependency) => {
      const externalDependency = await this.getExternalDependency(properyDependency.dependencyKey, extDeps);
      if (Helper.isNil(externalDependency) === false) {
        classDependencyInst[properyDependency.propertyName] = externalDependency;
        return;
      }

      const dependencyBuilder = this.dependencyBuilderStorage.getDependencyBuilder(properyDependency.dependencyKey);

      if (Helper.isNil(dependencyBuilder) === true) {
        throw new Error(`Class Dependency. Dependency in property not found! `
          + `Dependency: "${this.classDependency.name}". `
          + `Property: "${String(properyDependency.propertyName)}". `
          + `Provided dependency: "${Helper.getDependencyName(properyDependency.dependencyKey)}".`);
      }

      const dependencyInst = await dependencyBuilder.get();
      classDependencyInst[properyDependency.propertyName] = dependencyInst;
    });
    await Promise.all(propsDepsPr);

    return classDependencyInst;
  }
}
