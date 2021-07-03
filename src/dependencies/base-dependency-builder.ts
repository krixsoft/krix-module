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
   * Finds the dependency in the list of external dependencies. External dependency can be of two types.
   * UseValue external dependency will be returned as it is.
   * UseExisting external dependency will get the dependency builder and call `get` logic to get an instance
   * of dependency.
   *
   * @param  {Interfaces.DependencyKey} dependencyKey
   * @param  {Interfaces.ExternalDependency[]} externalDependencies
   * @return {Promise<any>}
   */
  async getExternalDependency (
    dependencyKey: Interfaces.DependencyKey,
    externalDependencies: Interfaces.ExternalDependency[],
  ): Promise<any> {
    if (_.isEmpty(externalDependencies) === true) {
      return null;
    }
    const externalDependency = _.find(externalDependencies, [ 'dependencyKey', dependencyKey ]);

    if (_.isNil(externalDependency) === true) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(externalDependency, 'useValue') === true) {
      return (externalDependency as Interfaces.UseValueDependency).useValue;
    }

    const existingDependency = (externalDependency as Interfaces.UseExistingDependency).useExisting;
    const dependencyBuilder = this.dependencyBuilderStorage.getDependencyBuilder(existingDependency);
    const dependencyInst = await dependencyBuilder.get();

    return dependencyInst;
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
