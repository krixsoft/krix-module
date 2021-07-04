import type { BaseDependencyBuilder } from './dependencies/base-dependency-builder';
import { Interfaces } from './shared';
import { Helper } from './shared';

export class DependencyBuilderStorage {
  private externalDependencyBuilderStorages: DependencyBuilderStorage[];
  private exportDependenciesSet: Set<Interfaces.DependencyKey>;
  private mainDependencyBuilderStorage: Map<Interfaces.DependencyKey, BaseDependencyBuilder>;

  static create (
  ): DependencyBuilderStorage {
    const inst = new DependencyBuilderStorage();
    return inst;
  }

  constructor () {
    this.mainDependencyBuilderStorage = new Map();
    this.externalDependencyBuilderStorages = [];
    this.exportDependenciesSet = new Set();
  }

  /**
   * Adds the external dependency builder storage to the list of external dependency storages.
   *
   * @param  {DependencyBuilderStorage} externalDependencyBuilderStorage
   */
  addExternalDependencyBuilderStorage (
    externalDependencyBuilderStorage: DependencyBuilderStorage,
  ): void {
    this.externalDependencyBuilderStorages.push(externalDependencyBuilderStorage);
  }

  /**
   * Sets the main dependency builder map. We iterate the main dependency in the first place.
   *
   * @param  {Interfaces.DependencyKey} dependencyKey
   * @param  {BaseDependencyBuilder} dependencyBuilder
   * @return {void}
   */
  setMainDependencyBuilder (
    dependencyKey: Interfaces.DependencyKey,
    dependencyBuilder: BaseDependencyBuilder,
  ): void {
    this.mainDependencyBuilderStorage.set(dependencyKey, dependencyBuilder);
  }

  /**
   * Sets the export dependency. The module's storage can get only external dependencies from
   * the external storages.
   *
   * @param  {Interfaces.DependencyKey} dependencyKey
   * @return {void}
   */
  setExportDependency (
    dependencyKey: Interfaces.DependencyKey,
  ): void {
    if (this.mainDependencyBuilderStorage.has(dependencyKey) === false) {
      throw new Error(`Can't export non-existing dependency: "${Helper.getDependencyName(dependencyKey)}".`);
    }

    this.exportDependenciesSet.add(dependencyKey);
  }

  /**
   * Finds and returns an instance of the dependency builder by the dependency key.
   *
   * @param  {Interfaces.DependencyKey} dependencyKey
   * @return {BaseDependencyBuilder}
   */
  getDependencyBuilder (
    dependencyKey: Interfaces.DependencyKey,
    checkExternal: boolean = false,
  ): BaseDependencyBuilder {
    if (checkExternal === true && this.exportDependenciesSet.has(dependencyKey) === false) {
      return null;
    }

    const internalDependencyBuilder = this.mainDependencyBuilderStorage.get(dependencyKey);
    if (Helper.isNil(internalDependencyBuilder) === false) {
      return internalDependencyBuilder;
    }

    for (const externalDependencyBuilderStorage of this.externalDependencyBuilderStorages) {
      const externalDependencyBuilder = externalDependencyBuilderStorage.getDependencyBuilder(dependencyKey, true);
      if (Helper.isNil(externalDependencyBuilder) === false) {
        return externalDependencyBuilder;
      }
    }

    return null;
  }
}
