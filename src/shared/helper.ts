import * as Constants from './constants';
import * as Interfaces from './interfaces';

export class Helper {
  /**
   * Property Deps
   */

  static getDependencyClassProperty (
    target: Interfaces.ClassDependency,
  ): Interfaces.DependencyClassProperty[] {
    const propDeps = Reflect.getMetadata(Constants.DependencyClassProperty, target);
    return propDeps ?? [];
  }

  static setDependencyClassProperty (
    value: Interfaces.DependencyKey,
    target: Interfaces.ClassDependency,
    propertyKey: string | symbol,
  ): void {
    const oldProps = this.getDependencyClassProperty(target);
    const newProp: Interfaces.DependencyClassProperty = {
      propertyName: propertyKey,
      dependencyKey: value,
    };
    const newProps = [ ...oldProps, newProp ];
    Reflect.defineMetadata(Constants.DependencyClassProperty, newProps, target);
  }

  /**
   * Parameter Deps
   */

  static getDependencyConstructorParameters (
    target: Interfaces.ClassDependency,
  ): Interfaces.DependencyConstructorParameter[] {
    const paramDeps = Reflect.getMetadata(Constants.DependencyConstructorParameters, target);
    return paramDeps ?? [];
  }

  static setDependencyConstructorParameters (
    value: Interfaces.DependencyKey,
    target: Interfaces.ClassDependency,
    index: number,
  ): void {
    const oldParams = this.getDependencyConstructorParameters(target);
    const newParam: Interfaces.DependencyConstructorParameter = {
      index: index,
      value: value,
    };
    const newParams = [ ...oldParams, newParam ];
    Reflect.defineMetadata(Constants.DependencyConstructorParameters, newParams, target);
  }

  /**
   * Config Deps
   */

  static getDependencyConfig (
    target: Interfaces.ClassDependency,
  ): Interfaces.DependencyConfig {
    const config = Reflect.getMetadata(Constants.DependencyConfig, target);
    return config ?? null;
  }

  static setDependencyConfig (
    config: Interfaces.DependencyConfig,
    target: Interfaces.ClassDependency | Function,
  ): void {
    Reflect.defineMetadata(Constants.DependencyConfig, config ?? {}, target);
  }

  /**
   * Returns an object which represent all class dependency constructor's params, dependency config
   * and class dependency properties.
   *
   * @param  {Interfaces.ClassDependency}
   * @return {Interfaces.ClassDescriptor}
   */
  static getClassDescriptor (
    dependencyClass: Interfaces.ClassDependency,
  ): Interfaces.ClassDescriptor {
    const constructorParams: any[] = Reflect.getMetadata(`design:paramtypes`, dependencyClass) ?? [];

    // Constructor params what were injected via Inject decorator
    const injectedParams: Interfaces.DependencyConstructorParameter[] =
      Helper.getDependencyConstructorParameters(dependencyClass);
    const injectedClassParams = (constructorParams ?? []).map((constructorParamValue: any, constructorParamIndex) => {
      const matchedInjectedParam = (injectedParams ?? []).find((injectedParam) => {
        return injectedParam.index === constructorParamIndex;
      });

      if (Helper.isNil(matchedInjectedParam) === false) {
        return matchedInjectedParam.value;
      }

      if (this.isNativeType(constructorParamValue) === true) {
        throw new Error(`Class Dependency. Constructor doesn't support native types! `
          + `Dependency: "${dependencyClass.name}". `
          + `Index: ${constructorParamIndex}. `
          + `Provided dependency: "${Helper.getDependencyName(constructorParamValue.name)}".`);
      }

      return constructorParamValue;
    });

    const injectedProps: Interfaces.DependencyClassProperty[] =
      Helper.getDependencyClassProperty(dependencyClass);

    return {
      constructorDeps: injectedClassParams,
      propsDeps: injectedProps,
    };
  }

  /**
   * Returns `true` if a type is a `native` type.
   *
   * @return {boolean}
   */
  static isNativeType (type: any): boolean {
    const types: any[] = [ String, Boolean, Number, Object ];
    return types.includes(type);
  }

  /**
   * Returns the name of dependency key.
   *
   * @param  {any} dependencyKey
   * @return {string}
   */
  static getDependencyName (
    dependencyKey: any,
  ): string {
    if (typeof dependencyKey === 'function' && Helper.isNil(dependencyKey.constructor) === false) {
        return dependencyKey.name;
    }

    return typeof dependencyKey;
  }

  /**
   * Checks if `value` is `null` or `undefined`.
   *
   * @param  {unknown} value
   * @return {boolean}
   */
  static isNil (value: unknown): value is null {
    return value === null || value === undefined;
  }
}
