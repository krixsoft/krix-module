import * as _ from 'lodash';
import { DependencyBuilderStorage as DependencyBuilderStorage } from '../dependency-builder.storage';

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
   * @return {any}
   */
  abstract create (
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
