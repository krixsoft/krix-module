import * as _ from 'lodash';

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
    const costructorParams: any[] = Reflect.getMetadata(`design:paramtypes`, dependencyClass) ?? [];

    // Constructor params what were injectd via Inject decorator
    const injectedParams: Interfaces.DependencyConstructorParameter[] =
      Helper.getDependencyConstructorParameters(dependencyClass);
    const injectedClassParams = _.map(costructorParams, (costructorParamValue: any, costructorParamIndex) => {
      const injectedParam = _.find(injectedParams, [ 'index', costructorParamIndex ]);

      if (_.isUndefined(injectedParam) === false) {
        return injectedParam.value;
      }

      if (this.isNativeType(costructorParamValue) === true) {
        throw new Error(`${dependencyClass.name} (${costructorParamIndex} -> ${costructorParamValue.name}).`
          + `Native types not supported.`);
      }

      return costructorParamValue;
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
    return _.includes(types, type);
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
    if (typeof dependencyKey === 'function' && _.isNil(dependencyKey.constructor) === false) {
        return dependencyKey.name;
    }

    return typeof dependencyKey;
  }

}
