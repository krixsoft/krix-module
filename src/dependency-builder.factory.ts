import { ClassDependencyBuilder } from './dependencies/class.dependency-builder';
import { UseClassDependencyBuilder } from './dependencies/use-class.dependency-builder';
import { UseExistingDependencyBuilder } from './dependencies/use-existing.dependency-builder';
import { UseFactoryClassDependencyBuilder } from './dependencies/use-factory-class.dependency-builder';
import { UseFactoryFunctionDependencyBuilder } from './dependencies/use-factory-function.dependency-builder';
import { UseValueDependencyBuilder } from './dependencies/use-value.dependency-builder';

import { Interfaces } from './shared';

type DependencyBuilder = ClassDependencyBuilder
  | UseClassDependencyBuilder
  | UseExistingDependencyBuilder
  | UseFactoryClassDependencyBuilder
  | UseFactoryFunctionDependencyBuilder
  | UseValueDependencyBuilder;

export class DependencyBuilderFactory {

  /**
   * Creates an instance of a dependency builder for the dependency.
   *
   * @param  {Interfaces.Dependency} dependency
   * @return {void}
   */
  static buildDependencyBuilder (
    dependency: Interfaces.Dependency,
  ): DependencyBuilder {
    if (typeof dependency !== 'object' && typeof dependency !== 'function') {
      throw new Error(`Dependency must be an object.`);
    }

    if (Object.prototype.hasOwnProperty.call(dependency, 'useClass')) {
      const useClassBuilder = UseClassDependencyBuilder
        .create(dependency as Interfaces.UseClassDependency);
      return useClassBuilder;
    }

    if (Object.prototype.hasOwnProperty.call(dependency, 'useValue')) {
      const useValueBuilder = UseValueDependencyBuilder
        .create(dependency as Interfaces.UseValueDependency);
      return useValueBuilder;
    }

    if (Object.prototype.hasOwnProperty.call(dependency, 'useFactoryFunction')) {
      const useFactoryFunctionBuilder = UseFactoryFunctionDependencyBuilder
        .create(dependency as Interfaces.UseFactoryFunctionDependency);
      return useFactoryFunctionBuilder;
    }

    if (Object.prototype.hasOwnProperty.call(dependency, 'useFactoryClass')) {
      const useFactoryClassBuilder = UseFactoryClassDependencyBuilder
        .create(dependency as Interfaces.UseFactoryClassDependency);
      return useFactoryClassBuilder;
    }

    if (Object.prototype.hasOwnProperty.call(dependency, 'useExisting')) {
      const useExistingClassBuilder = UseExistingDependencyBuilder
        .create(dependency as Interfaces.UseExistingDependency);
      return useExistingClassBuilder;
    }

    const classBuilder = ClassDependencyBuilder
      .create(dependency as Interfaces.ClassDependency);
    return classBuilder;
  }
}
