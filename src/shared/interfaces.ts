
export interface DependencyClass extends Function {
  // tslint:disable-next-line
  new (...args: any[]): any;
}

export interface FactoryDependencyClass extends DependencyClass {
  /**
   * Function which will be called to create a some dependency.
   */
  build: () => any;
}

export type DependencyKey = string | symbol | DependencyClass;

export namespace DependencyType {
  export interface Base {
    /**
     * Key which will be used to get a some dependency.
     */
    dependencyKey: DependencyKey;
  }

  export interface Value extends Base {
    /**
     * Some value, which will be added to Krix DI without any transformations.
     */
    useValue: any;
  }

  export interface Class extends Base {
    /**
     * Regular class without Krix Dependency decorator.
     */
    useClass: DependencyClass;
    /**
     * If `false` - every `get` of this dependency will create an instance of `useClass` class.
     *
     * @default true
     */
    singletone: boolean;
    /**
     * The list of dependencies which will be injected to `useClass` class.
     */
    dependencies?: DependencyKey[];
  }

  export interface FactoryFunction extends Base {
    /**
     * Regular function which will be called to create a some dependency.
     *
     * FYI: External code can't get an access to factory function.
     */
    useFactoryFunction: Function;
    /**
     * If `false` - every `get` of this dependency will call `useFactory` function.
     *
     * @default true
     */
    singletone: boolean;
    /**
     * The list of dependencies which will be injected to `useFactory` function.
     */
    dependencies?: DependencyKey[];
  }

  export interface FactoryClass extends Base {
    /**
     * Class with Krix Dependency decorator which implements `build` method.
     *
     * FYI: External code can't get an access to factory class.
     */
    useFactoryClass: FactoryDependencyClass;
    /**
     * If `false` - every `get` of this dependency will call `build` method of `useFactory` class.
     *
     * @default true
     */
    singletone: boolean;
  }

  export interface Existing extends Base {
    /**
     * Class with Krix Dependency decorator which will be used instead of a some
     * dependency (dependencyKey).
     */
    useExisting: DependencyKey;
  }
}

export type Dependency = DependencyClass | DependencyType.Class | DependencyType.Value
  | DependencyType.FactoryFunction | DependencyType.FactoryClass | DependencyType.Existing;


export interface DependencyDescriptor {
  /**
   * If `false` - every `get` of this dependency will create an instance of decorated class.
   *
   * @default true
   */
  singletone: boolean;
}


export type ImportSectionElement = DependencyClass;
export type ExportSectionElement = DependencyKey;

export interface ModuleDescriptor {
  /**
   * The list of modules, which are imported to the current module. Current module can use `export` dependencies
   * of the imported modules.
   */
  imports?: ImportSectionElement[];
  /**
   * The list of dependencies of the current module. Dependency config:
   *  - Class (class) - it's a class with Krix Dependency decorator.
   *
   *  - UseClass (config) - it's a regular class without Krix Dependency decorator. Config gets the list of dependencies
   *    which will be injected to constructor of UseClass class.
   *
   *  - UseValue (config) - it's a some value, which will be added to Krix DI without any transformations.
   *
   *  - UseFactory (config) - it's a class with Krix Dependency decorator which implements `build` method or a regular
   *    function + the list of dependencies which will be injected to UseFactory function.
   *
   *  - UseExisting (config) - it's a class with Krix Dependency decorator which will be used instead of a some
   *   dependency.
   */
  dependencies?: Dependency[];
  /**
   * The list of dependencies which we reexport from this module.
   *
   * FYI: Throws an error if a some dependency isn't defined in this module.
   */
  exports?: ExportSectionElement[];
}


export interface ExternalDependency {
  key: DependencyKey;
  value: Dependency;
}
