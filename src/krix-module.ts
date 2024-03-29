import type { Interfaces } from './shared';
import { Helper } from './shared';
import { UseValueDependencyBuilder } from './dependencies/use-value.dependency-builder';
import { DependencyBuilderStorage } from './dependency-builder.storage';
import { DependencyBuilderFactory } from './dependency-builder.factory';

export class KxModule {
  private moduleDependencyBuilderStorage: DependencyBuilderStorage;

  /**
   * Creates a new instance of module. Every module has a uniq instance of dependency builder store.
   *
   * @param  {Interfaces.ModuleConfig} moduleConfig
   * @return {void}
   */
  static init (
    moduleConfig: Interfaces.ModuleConfig,
  ): KxModule {
    const inst = new KxModule(moduleConfig);
    return inst;
  }

  constructor (
    private moduleConfig: Interfaces.ModuleConfig,
  ) {
    this.init();
  }

  /**
   * Inits the module:
   *  - creates module's dependency builder storage (DBS);
   *  - creates the dependency builder for every module's dependency;
   *  - fills the module's DBS using the module's dependency builders.
   *
   * FYI: Every dependency builder gets the link to module's DBS. We fill this module's DBS before
   * a some dependency builder will be used so every dependency builder will have an actual version
   * of DBS.
   *
   * @return {void}
   */
  private init (
  ): void {
    // Create the module's dependency builder storage
    this.moduleDependencyBuilderStorage = DependencyBuilderStorage.create();

    // Create the dependency builder for every dependency in the list of dependencies and adds this
    // dependency builder to the module's dependency builder storage
    (this.moduleConfig.dependencies ?? []).map((dependency) => {
      // FYI: Class dependency doesn't have dependencyKey
      const dependencyKey = ((dependency as Interfaces.Base)?.dependencyKey ?? dependency) as Interfaces.DependencyKey;

      if (Helper.isNil(dependencyKey) === true) {
        throw new Error(`Dependency must have a key!`);
      }

      const dependencyBuilder = DependencyBuilderFactory.buildDependencyBuilder(dependency);
      dependencyBuilder.setDependencyBuilderStorage(this.moduleDependencyBuilderStorage);

      this.moduleDependencyBuilderStorage.setMainDependencyBuilder(dependencyKey, dependencyBuilder);
    });

    // Sets the export dependencies in module's storage
    (this.moduleConfig.export ?? []).map((dependencyKey) => {
      this.moduleDependencyBuilderStorage.setExportDependency(dependencyKey);
    });

    // Iterate all external modules and set their DBS to the module's DBS as external DBS
    (this.moduleConfig.import ?? []).map((externalKxModule) => {
      const externalDependencyBuilderMap = externalKxModule.getDependencyBuilderStorage();

      this.moduleDependencyBuilderStorage.addExternalDependencyBuilderStorage(externalDependencyBuilderMap);
    });

    const moduleDependencyBuilder = UseValueDependencyBuilder.create({
      dependencyKey: KxModule,
      useValue: this,
    });

    this.moduleDependencyBuilderStorage.setMainDependencyBuilder(KxModule, moduleDependencyBuilder);
  }

  /**
   * Returns the module's dependency builder storage.
   *
   * @return {DependencyBuilderStorage}
   */
  getDependencyBuilderStorage (
  ): DependencyBuilderStorage {
    return this.moduleDependencyBuilderStorage;
  }

  /**
   * Creates a new dependency. If `extDeps` is defined, method will use these dependencies instead of
   * required ones in dependency builder.
   *
   * @param  {Interfaces.DependencyKey} dependencyKey
   * @param  {Interfaces.ExternalDependency[]} extDeps
   * @return {Promise<TDependency>}
   */
  async create <TDependency = any> (
    dependencyKey: Interfaces.ClassDependency<TDependency> | string | symbol,
    extDeps?: Interfaces.ExternalDependency[],
  ): Promise<TDependency> {
    const dependencyBuilder = this.moduleDependencyBuilderStorage.getDependencyBuilder(dependencyKey);
    if (Helper.isNil(dependencyBuilder) === true) {
      throw new Error(`Can't create the dependency: "${Helper.getDependencyName(dependencyKey)}". `
        + `Dependency not found.`);
    }

    const dependency = await dependencyBuilder.create(extDeps);
    return dependency;
  }

  /**
   * Returns the instance of dependency by the dependency key.
   *
   * @param  {Interfaces.DependencyKey} dependencyKey
   * @return {Promise<TDependency>}
   */
  async get <TDependency = any> (
    dependencyKey: Interfaces.ClassDependency<TDependency> | string | symbol,
  ): Promise<TDependency> {
    const dependencyBuilder = this.moduleDependencyBuilderStorage.getDependencyBuilder(dependencyKey);
    if (Helper.isNil(dependencyBuilder) === true) {
      throw new Error(`Can't get the dependency: "${Helper.getDependencyName(dependencyKey)}". `
        + `Dependency not found.`);
    }

    const dependency = await dependencyBuilder.get();
    return dependency;
  }
}
