import { DependencyBuilderStorage } from '../dependency-builder.storage';

import type { Interfaces } from '../shared';

import { BaseDependencyBuilder } from './base-dependency-builder';

import { ClassDependencyBuilder } from './class.dependency-builder';

export class UseFactoryClassDependencyBuilder extends BaseDependencyBuilder {
  private factoryClassDependencyBuilder: ClassDependencyBuilder;

  static create (
    useFactoryClassDependency: Interfaces.UseFactoryClassDependency,
  ): UseFactoryClassDependencyBuilder {
    const inst = new UseFactoryClassDependencyBuilder(useFactoryClassDependency);
    return inst;
  }

  constructor (
    useFactoryClassDependency: Interfaces.UseFactoryClassDependency,
  ) {
    super();

    this.dependencyIsSingleton = useFactoryClassDependency?.singleton !== false;

    // Creates the Class dependency builder for the factory class
    this.factoryClassDependencyBuilder = ClassDependencyBuilder.create(useFactoryClassDependency.useFactoryClass);
  }

  /**
   * Sets the dependency storage and share it with Class dependency builder of the factory class.
   *
   * @param  {DependencyBuilderStorage} dependencyBuilderMap
   * @return {void}
   */
  setDependencyBuilderStorage (
    dependencyBuilderMap: DependencyBuilderStorage,
  ): void {
    super.setDependencyBuilderStorage(dependencyBuilderMap);

    // Share access to module dependency storage in class dependency of the factory class
    this.factoryClassDependencyBuilder.setDependencyBuilderStorage(dependencyBuilderMap);
  }

  /**
   * Calls the factory method in the factory class to create an instance of the dependency. Factory class will be
   * created as a class dependency.
   *
   * @return {Promise<any>}
   */
  async create (
  ): Promise<any> {
    // Get the instance of factory class
    const useFactoryClassDependencyInst = await this.factoryClassDependencyBuilder.get();

    // Build the instance of the dependency
    const useFactoryClassDependencyResult = await useFactoryClassDependencyInst.build();
    return useFactoryClassDependencyResult;
  }
}
