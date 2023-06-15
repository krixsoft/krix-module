import { KxModule } from '../krix-module';

/**
 * Class with Krix Dependency decorator.
 */
export interface ClassDependency<T = any> extends Function {
  // tslint:disable-next-line
  new (...args: any[]): T;
}

export interface FactoryClassDependency {
  /**
   * Function which will be called to create a some dependency.
   */
  build (): any;
}

export type DependencyKey = string | symbol | ClassDependency;

export interface Base {
  /**
   * Key which will be used to get a some dependency.
   */
  dependencyKey: DependencyKey;
}

/**
 * Value, which will be added to Krix DI without any transformations.
 */
export interface UseValueDependency extends Base {
  /**
   * Some value, which will be added to Krix DI without any transformations.
   */
  useValue: any;
}

/**
 * Regular class without Krix Dependency decorator. Config gets the list of dependencies
 * which will be injected to constructor of UseClass class.
 */
export interface UseClassDependency extends Base {
  /**
   * Regular class without Krix Dependency decorator.
   */
  useClass: ClassDependency;
  /**
   * If `false` - every `get` of this dependency will create an instance of `useClass` class.
   *
   * @default true
   */
  singleton?: boolean;
  /**
   * The list of dependencies which will be injected to `useClass` class.
   */
  dependencies?: DependencyKey[];
}

/**
 * Function + the list of dependencies which will be injected to UseFactory function.
 */
export interface UseFactoryFunctionDependency extends Base {
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
  singleton?: boolean;
  /**
   * The list of dependencies which will be injected to `useFactory` function.
   */
  dependencies?: DependencyKey[];
}

/**
 * Class with Krix Dependency decorator which implements `build` method.
 */
export interface UseFactoryClassDependency extends Base {
  /**
   * Class with Krix Dependency decorator which implements `build` method.
   *
   * FYI: External code can't get an access to factory class.
   */
  useFactoryClass: new (...args: any[]) => FactoryClassDependency;
  /**
   * If `false` - every `get` of this dependency will call `build` method of `useFactory` class.
   *
   * @default true
   */
  singleton?: boolean;
}

/**
 * Class with Krix Dependency decorator which will be used instead of a some dependency.
 */
export interface UseExistingDependency extends Base {
  /**
   * Defined dependency which will be used instead of another dependency (dependencyKey).
   */
  useExisting: DependencyKey;
}

export type Dependency = ClassDependency | UseClassDependency | UseValueDependency
  | UseFactoryFunctionDependency | UseFactoryClassDependency | UseExistingDependency;


export interface DependencyConfig {
  /**
   * If `false` - every `get` of this dependency will create an instance of decorated class.
   *
   * @default true
   */
  singleton?: boolean;
}


export type ImportSectionElement = ClassDependency;
export type ExportSectionElement = DependencyKey;

export interface ModuleConfig {
  /**
   * The list of modules, which are imported to the current module. Current module can use `export` dependencies
   * of the imported modules.
   */
  import?: KxModule[];
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
  export?: ExportSectionElement[];
}


export type ExternalDependency = UseValueDependency | UseExistingDependency;

export interface DependencyClassProperty {
  propertyName: PropertyKey;
  dependencyKey: DependencyKey;
}

export interface DependencyConstructorParameter {
  index: number;
  value: DependencyKey;
}

export interface ClassDescriptor {
  constructorDeps: any[];
  propsDeps: DependencyClassProperty[];
}
