import * as _ from 'lodash';
import { DependencyBuilderStorage } from '../dependency-builder.storage';
import { Interfaces } from '../shared';

export abstract class BaseDependencyBuilder {
  protected dependencyIsSingleton: boolean;
  protected inst: any;

  protected dependencyBuilderStorage: DependencyBuilderStorage;

  /**
   * Sets the dependency storage.
   *
   * @param  {DependencyBuilderStorage} dependencyBuilderStorage
   * @return {void}
   */
  setDependencyBuilderStorage (
    dependencyBuilderStorage: DependencyBuilderStorage,
  ): void {
    this.dependencyBuilderStorage = dependencyBuilderStorage;
  }

  /**
   * Creates a new instance of the dependency.
   *
   * @abstract
   * @param  {Interfaces.ExternalDependency[]} [extDeps]
   * @return {any}
   */
  abstract create (
    extDeps?: Interfaces.ExternalDependency[],
  ): any;

  /**
   * Returns the instance of dependency. If dependency isn't created, it will be created.
   * If dependency isn't a singleton, method will create a new instance every time.
   *
   * @return {any}
   */
  async get (
  ): Promise<any> {
    if (this.dependencyIsSingleton === true && _.isNil(this.inst) === false) {
      return this.inst;
    }

    this.inst = await this.create();
    return this.inst;
  }
}
