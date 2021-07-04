**krix/module** - a lightweight library which helps to build module-based application. It's an independent part of Krix ecosystem and it's based on usage of the Dependency Injection pattern.

# Installation
```
npm install -S @krix/module reflect-metadata
```

# Introduction
## What for?
Module-based application allows to implement a strong structed application in one uniform style and reduces threshold required to understand your application. Using Dependency Injection pattern allows to reduce a number of factory-oriented logic and provides a wide range of opportunities to create Dependencies different types.


## Concepts
**Dependency** - a some entity which developer provides into DI-based module with an instruction how to create and get it.

**DI-based module** - a package-implemented dependency which developer uses to define application dependencies in the module. This dependency provides an interface to create and get other dependencies. It's available for module-defined dependencies as a sub-dependency.

**Sub-dependency** - a regular dependency which another dependency can request for its work.

Our module system allows to create next dependencies:
 - `Class` dependency - a regular class with Krix `@Dependency` decorator.
 - `UseClass` dependency - a regular class without Krix `@Dependency` decorator.
 - `UseValue` dependency - a value, which will be added to Krix module without any transformations.
 - `UseFactoryFunction` dependency - a regular function which will be called to create a some dependency.
 - `UseFactoryClass` dependency - a regular class with Krix `@Dependency` decorator which implements `build` method.
 - `UseExisting` dependency - a defined dependency which will be used instead of another dependency.

## Setup
At first you need to import `reflect-metadata` package in the application's entrypoint file. Example:

```typescript
// index.ts
import 'reflect-metadata';

// other code...
```
And enable `experimentalDecorators` and `emitDecoratorMetadata` options in your TS config. Example:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
}
```

After that you can create your first module. Example:

```typescript
// app.module.ts
import { KxModule } from '@krix/module';

const appModule = KxModule.init({
  import: [],
  dependencies: [
  ],
  export: [],
});
// other code...
```

Every module cosists of 3 section:
 - `dependencies` - the list of dependencies which are available in the module
 - `export` - the list of dependencies which other modules can request from this module. All export dependencies must be defined in `dependencies` section.
 - `import` - the list of external modules which provides some public dependencies.

Now, let's create a simple Class dependency and request its instance.

```typescript
// app.module.ts
import { KxModule, Dependency } from '@krix/module';

@Dependency()
class SimpleDependency {
  test (): void {
    console.log(`Hello World`);
  }
}

const appModule = KxModule.init({
  import: [],
  dependencies: [
    SimpleDependency,
  ],
  export: [],
});

async function bootstrap () {
  const simpleDependency = await appModule.get<SimpleDependency>(SimpleDependency);
  simpleDependency.test(); // Hello World
  // other code...
}

bootstrap();
```

And that's all! We've described a `SimpleDependency` class, defined it in `App` module and requested to create it.

Now, let's complicate the code, create the complex dependency which will create a sub-dependency.


```typescript
// app.module.ts
import { KxModule, Dependency } from '@krix/module';

@Dependency()
class SimpleDependency {
  constructor () {
    console.log(`Hello World Simple dependency`);
  }

  test (): void {
    console.log(`Test simple dependency!`);
  }
}

@Dependency()
class ComplexDependency {
  constructor (
    public simpleDependency: SimpleDependency,
  ) {
    console.log(`Hello World Complex dependency`);
  }

  test (): void {
    this.simpleDependency.test();
    console.log(`Test complex dependency!`);
  }
}


const appModule = KxModule.init({
  import: [],
  dependencies: [
    SimpleDependency,
    ComplexDependency,
  ],
  export: [],
});

async function bootstrap () {
  const complexDependency = await appModule.get<ComplexDependency>(ComplexDependency);
  // Hello World Simple dependency
  // Hello World Complex dependency
  this.complexDependency.test();
  // Test simple dependency!
  // Test complex dependency!
  // other code...
}

bootstrap();
```
