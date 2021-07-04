import { DependencyBuilderStorage } from '../dependency-builder.storage';
import { Interfaces } from '../shared';
import { Helper } from '../shared';

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
  protected async getExternalDependency (
    dependencyKey: Interfaces.DependencyKey,
    externalDependencies: Interfaces.ExternalDependency[],
  ): Promise<any> {
    const matchedExternalDependency = (externalDependencies ?? []).find((externalDependency) => {
      return externalDependency.dependencyKey === dependencyKey;
    });

    if (Helper.isNil(matchedExternalDependency) === true) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(matchedExternalDependency, 'useValue') === true) {
      return (matchedExternalDependency as Interfaces.UseValueDependency).useValue;
    }

    const existingDependency = (matchedExternalDependency as Interfaces.UseExistingDependency).useExisting;
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
    if (this.dependencyIsSingleton === true && Helper.isNil(this.inst) === false) {
      return this.inst;
    }

    this.inst = await this.create();
    return this.inst;
  }
}
