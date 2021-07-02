/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
// import * as sinon from 'sinon';
import * as _ from 'lodash';
import 'reflect-metadata';

import { Dependency, Inject } from '../dist/decorators';
import { KxModule } from '../dist/krix-module';
import { Interfaces } from '../dist/shared';

describe(`KxModule`, () => {

  it('should create an instance of Krix Module', () => {
    const kxModule = KxModule.init({});
    expect(kxModule).to.be.an.instanceOf(KxModule);
  });

  it(`should create an instance of Krix Module with a dependency`, () => {
    @Dependency()
    class DependencyA {
    }

    const kxModule = KxModule.init({
      dependencies: [
        DependencyA,
      ],
    });
    expect(kxModule).to.be.an.instanceOf(KxModule);
  });

  it(`should create an instance of Krix Module with several dependencies`, () => {
    @Dependency()
    class DependencyA {
    }

    @Dependency()
    class DependencyB {
    }

    const kxModule = KxModule.init({
      dependencies: [
        DependencyA,
        DependencyB,
      ],
    });
    expect(kxModule).to.be.an.instanceOf(KxModule);
  });

  describe(`Class dependency`, () => {
    it(`'create' should create a new instance`, async () => {
      @Dependency()
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
        ],
      });

      const dependencyA = await kxModule.create(DependencyA);
      expect(dependencyA).to.be.an.instanceOf(DependencyA);
    });

    it(`two 'create' should return 2 different instance of dependency`, async () => {
      @Dependency()
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
        ],
      });

      const dependencyCreateA1 = await kxModule.create(DependencyA);
      const dependencyCreateA2 = await kxModule.create(DependencyA);
      expect(dependencyCreateA1).not.to.be.equal(dependencyCreateA2);
    });

    it(`'get' should create a new instance and return it`, async () => {
      @Dependency()
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
        ],
      });

      const dependencyA = await kxModule.get(DependencyA);
      expect(dependencyA).to.be.an.instanceOf(DependencyA);
    });

    it(`two 'get' should return one instance (singleton)`, async () => {
      @Dependency()
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
        ],
      });

      const dependencyGetA1 = await kxModule.get(DependencyA);
      const dependencyGetA2 = await kxModule.get(DependencyA);
      expect(dependencyGetA1).to.be.equal(dependencyGetA2);
    });

    it(`two 'get' should return two different instances (non-singleton)`, async () => {
      @Dependency({ singletone: false })
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
        ],
      });

      const dependencyGetA1 = await kxModule.get(DependencyA);
      const dependencyGetA2 = await kxModule.get(DependencyA);
      expect(dependencyGetA1).not.to.be.equal(dependencyGetA2);
    });

    it(`'create' should return a new instance which doesn't equal instance from 'get'`, async () => {
      @Dependency()
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
        ],
      });

      const dependencyGetA = await kxModule.get(DependencyA);
      const dependencyCreateA = await kxModule.create(DependencyA);
      expect(dependencyCreateA).not.to.be.equal(dependencyGetA);
    });

    it(`should create a Class dependency with constructor dependency`, async () => {
      @Dependency()
      class SubDependency {
      }
      @Dependency()
      class MainDependency {
        constructor (
          public subDependency: SubDependency,
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          SubDependency,
          MainDependency,
        ],
      });

      const mainDependency = await kxModule.create<MainDependency>(MainDependency);
      expect(mainDependency).to.be.an.instanceOf(MainDependency);
      expect(mainDependency.subDependency).not.to.be.undefined;
    });

    it(`should create a Class dependency with injected property dependency`, async () => {
      @Dependency()
      class SubDependency {
      }
      @Dependency()
      class MainDependency {
        @Inject(SubDependency)
        public subDependency: SubDependency;
        constructor (
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          SubDependency,
          MainDependency,
        ],
      });

      const mainDependency = await kxModule.create<MainDependency>(MainDependency);
      expect(mainDependency).to.be.an.instanceOf(MainDependency);
      expect(mainDependency.subDependency).not.to.be.undefined;
    });

    it(`should create a Class dependency with injected constructor dependency`, async () => {
      abstract class AbstractSubDependency {
      }
      @Dependency()
      class SubDependency {
      }
      @Dependency()
      class MainDependency {
        constructor (
          @Inject(SubDependency)
          public subDependency: AbstractSubDependency,
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          SubDependency,
          MainDependency,
        ],
      });

      const mainDependency = await kxModule.create<MainDependency>(MainDependency);
      expect(mainDependency).to.be.an.instanceOf(MainDependency);
      expect(mainDependency.subDependency).not.to.be.undefined;
    });

    it(`should throw an error if dependency in constructor isn't defined`, async () => {
      @Dependency()
      class SubDependency {
      }
      @Dependency()
      class MainDependency {
        constructor (
          public subDependency: SubDependency,
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          MainDependency,
        ],
      });

      let testError: Error;
      try {
        await kxModule.create<MainDependency>(MainDependency);
      } catch (error) {
        testError = error;
      }

      expect(testError).not.to.be.undefined;
      expect(testError.message).to.be.equal(`Class Dependency. Dependency in constructor not found! Dependency: "MainDependency". Index: 0. Provided dependency: "SubDependency".`);
    });

    it(`should throw an error if dependency in property isn't defined`, async () => {
      @Dependency()
      class SubDependency {
      }
      @Dependency()
      class MainDependency {
        @Inject(SubDependency)
        public subDependency: SubDependency;

        constructor (
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          MainDependency,
        ],
      });

      let testError: Error;
      try {
        await kxModule.create<MainDependency>(MainDependency);
      } catch (error) {
        testError = error;
      }

      expect(testError).not.to.be.undefined;
      expect(testError.message).to.be.equal(`Class Dependency. Dependency in property not found! Dependency: "MainDependency". Property: "subDependency". Provided dependency: "SubDependency".`);
    });

    it(`should throw an error if dependency in constructor is a primitive`, async () => {
      let testError: Error;
      try {
        @Dependency()
        class MainDependency {
          constructor (
            public subDependency: number,
          ) {}
        }

        const kxModule = KxModule.init({
          dependencies: [
            MainDependency,
          ],
        });

        await kxModule.create<MainDependency>(MainDependency);
      } catch (error) {
        testError = error;
      }

      expect(testError).not.to.be.undefined;
      expect(testError.message).to.be.equal(`Class Dependency. Constructor doesn't support native types! Dependency: "MainDependency". Index: 0. Provided dependency: "string".`);
    });
  });

  describe(`UseClass dependency`, () => {
    it(`'create' should create a new instance`, async () => {
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: DependencyA, useClass: DependencyA },
        ],
      });

      const dependencyA = await kxModule.create(DependencyA);
      expect(dependencyA).to.be.an.instanceOf(DependencyA);
    });

    it(`two 'create' should return 2 different instance of dependency`, async () => {
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: DependencyA, useClass: DependencyA },
        ],
      });

      const dependencyCreateA1 = await kxModule.create(DependencyA);
      const dependencyCreateA2 = await kxModule.create(DependencyA);
      expect(dependencyCreateA1).not.to.be.equal(dependencyCreateA2);
    });

    it(`'get' should create a new instance and return it`, async () => {
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: DependencyA, useClass: DependencyA },
        ],
      });

      const dependencyA = await kxModule.get(DependencyA);
      expect(dependencyA).to.be.an.instanceOf(DependencyA);
    });

    it(`two 'get' should return one instance (singleton)`, async () => {
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: DependencyA, useClass: DependencyA },
        ],
      });

      const dependencyGetA1 = await kxModule.get(DependencyA);
      const dependencyGetA2 = await kxModule.get(DependencyA);
      expect(dependencyGetA1).to.be.equal(dependencyGetA2);
    });

    it(`two 'get' should return two different instances (non-singleton)`, async () => {
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: DependencyA, useClass: DependencyA, singletone: false },
        ],
      });

      const dependencyGetA1 = await kxModule.get(DependencyA);
      const dependencyGetA2 = await kxModule.get(DependencyA);
      expect(dependencyGetA1).not.to.be.equal(dependencyGetA2);
    });

    it(`'create' should return a new instance which doesn't equal instance from 'get'`, async () => {
      class DependencyA {
      }

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: DependencyA, useClass: DependencyA },
        ],
      });

      const dependencyGetA = await kxModule.get(DependencyA);
      const dependencyCreateA = await kxModule.create(DependencyA);
      expect(dependencyCreateA).not.to.be.equal(dependencyGetA);
    });

    it(`should create a UseClass dependency with constructor dependency`, async () => {
      @Dependency()
      class SubDependency {
      }
      class MainDependency {
        constructor (
          public subDependency: SubDependency,
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: MainDependency, useClass: MainDependency, dependencies: [ SubDependency ] },
          SubDependency,
        ],
      });

      const mainDependency = await kxModule.create<MainDependency>(MainDependency);
      expect(mainDependency).to.be.an.instanceOf(MainDependency);
      expect(mainDependency.subDependency).not.to.be.undefined;
    });

    it(`should throw an error if dependency isn't provided in module definition`, async () => {
      @Dependency()
      class SubDependency {
      }
      class MainDependency {
        constructor (
          public subDependency: SubDependency,
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: MainDependency, useClass: MainDependency, dependencies: [ SubDependency ] },
        ],
      });

      let testError: Error;
      try {
        await kxModule.create<MainDependency>(MainDependency);
      } catch (error) {
        testError = error;
      }

      expect(testError.message).to.be.equal(`UseClass Dependency. Provided dependency not found! Dependency: "MainDependency". Index: 0. Provided dependency: "SubDependency".`);
    });
  });

  describe(`UseValue dependency`, () => {
    it(`'create' should return the provided value`, async () => {
      const depKey = `UseValueDependency`;
      const dependency = { value: 'Hello World' };

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: depKey, useValue: dependency },
        ],
      });

      const useValueDependency = await kxModule.create(depKey);
      expect(useValueDependency).to.equal(dependency);
    });

    it(`two 'create' should return the same provided value`, async () => {
      const depKey = `UseValueDependency`;
      const dependency = { value: 'Hello World' };

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: depKey, useValue: dependency },
        ],
      });

      const useValueDependencyCreate1 = await kxModule.create(depKey);
      const useValueDependencyCreate2 = await kxModule.create(depKey);
      expect(useValueDependencyCreate1).to.equal(dependency);
      expect(useValueDependencyCreate1).to.equal(useValueDependencyCreate2);
    });

    it(`'get' should return the provided value`, async () => {
      const depKey = `UseValueDependency`;
      const dependency = { value: 'Hello World' };

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: depKey, useValue: dependency },
        ],
      });

      const useValueDependencyCreate = await kxModule.get(depKey);
      expect(useValueDependencyCreate).to.equal(dependency);
    });

    it(`two 'get' should return the same provided value`, async () => {
      const depKey = `UseValueDependency`;
      const dependency = { value: 'Hello World' };

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: depKey, useValue: dependency },
        ],
      });

      const useValueDependencyGet1 = await kxModule.get(depKey);
      const useValueDependencyGet2 = await kxModule.get(depKey);
      expect(useValueDependencyGet1).to.equal(dependency);
      expect(useValueDependencyGet1).to.equal(useValueDependencyGet2);
    });

    it(`'create' should return the same value as 'get'`, async () => {
      const depKey = `UseValueDependency`;
      const dependency = { value: 'Hello World' };

      const kxModule = KxModule.init({
        dependencies: [
          { dependencyKey: depKey, useValue: dependency },
        ],
      });

      const useValueDependencyCreate = await kxModule.create(depKey);
      const useValueDependencyGet = await kxModule.get(depKey);
      expect(useValueDependencyCreate).to.equal(dependency);
      expect(useValueDependencyGet).to.equal(dependency);
      expect(useValueDependencyCreate).to.equal(useValueDependencyGet);
    });
  });

  describe(`UseFactoryFunction dependency`, () => {
    it(`'create' should create a new instance`, async () => {
      const depKey = `UseFactoryFunctionDependency`;
      const factoryValue = {};

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryFunction: () => {
              return factoryValue;
            },
          },
        ],
      });

      const useFactoryFunctionDependency = await kxModule.create(depKey);
      expect(useFactoryFunctionDependency).to.be.equal(factoryValue);
    });

    it(`two 'create' should return 2 different instance of dependency`, async () => {
      const depKey = `UseFactoryFunctionDependency`;

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryFunction: () => {
              const factoryValue = {};
              return factoryValue;
            },
          },
        ],
      });

      const useFactoryFunctionDependency1 = await kxModule.create(depKey);
      const useFactoryFunctionDependency2 = await kxModule.create(depKey);
      expect(useFactoryFunctionDependency1).not.to.be.equal(useFactoryFunctionDependency2);
    });

    it(`'get' should create a new instance and return it`, async () => {
      const depKey = `UseFactoryFunctionDependency`;
      const factoryValue = {};

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryFunction: () => {
              return factoryValue;
            },
          },
        ],
      });

      const useFactoryFunctionDependency = await kxModule.get(depKey);
      expect(useFactoryFunctionDependency).to.be.equal(factoryValue);
    });

    it(`two 'get' should return one instance (singleton)`, async () => {
      const depKey = `UseFactoryFunctionDependency`;

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryFunction: () => {
              const factoryValue = {};
              return factoryValue;
            },
          },
        ],
      });

      const useFactoryFunctionDependency1 = await kxModule.get(depKey);
      const useFactoryFunctionDependency2 = await kxModule.get(depKey);
      expect(useFactoryFunctionDependency1).to.be.equal(useFactoryFunctionDependency2);
    });

    it(`two 'get' should return two different instances (non-singleton)`, async () => {
      const depKey = `UseFactoryFunctionDependency`;

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryFunction: () => {
              const factoryValue = {};
              return factoryValue;
            },
            singletone: false,
          },
        ],
      });

      const useFactoryFunctionDependency1 = await kxModule.get(depKey);
      const useFactoryFunctionDependency2 = await kxModule.get(depKey);
      expect(useFactoryFunctionDependency1).not.to.be.equal(useFactoryFunctionDependency2);
    });

    it(`'create' should return a new instance which doesn't equal instance from 'get'`, async () => {
      const depKey = `UseFactoryFunctionDependency`;

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryFunction: () => {
              const factoryValue = {};
              return factoryValue;
            },
          },
        ],
      });

      const useFactoryFunctionCreate = await kxModule.create(depKey);
      const useFactoryFunctionGet = await kxModule.get(depKey);
      expect(useFactoryFunctionCreate).not.to.be.equal(useFactoryFunctionGet);
    });

    it(`should create an async dependency`, async () => {
      const depKey = `UseFactoryFunctionDependency`;

      const factoryValue = 42;

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryFunction: async () => {
              const factoryValueResult = await Promise.resolve(factoryValue);
              return factoryValueResult;
            },
          },
        ],
      });

      const useFactoryFunctionDependency = await kxModule.create(depKey);
      expect(useFactoryFunctionDependency).to.be.equal(factoryValue);
    });

    it(`should create a UseClass dependency with constructor dependency`, async () => {
      const initialSubDependencyValue = {};
      @Dependency()
      class SubDependency {
        getValue () {
          return initialSubDependencyValue;
        }
      }

      const depKey = `UseFactoryFunctionDependency`;

      interface UseFactoryResult {
        value: object;
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryFunction: (subDependency: SubDependency) => {
              const subDependencyValue = subDependency.getValue();
              const factoryValue = { value: subDependencyValue };
              return factoryValue;
            },
            dependencies: [
              SubDependency,
            ],
          },
          SubDependency,
        ],
      });

      const useFactoryFunctionDependency = await kxModule.create<UseFactoryResult>(depKey);
      expect(useFactoryFunctionDependency.value).to.be.equal(initialSubDependencyValue);
    });

    it(`should throw an error if dependency isn't provided in module definition`, async () => {
      const initialSubDependencyValue = {};
      @Dependency()
      class SubDependency {
        getValue () {
          return initialSubDependencyValue;
        }
      }

      const depKey = `UseFactoryFunctionDependency`;

      interface UseFactoryResult {
        value: object;
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryFunction: (subDependency: SubDependency) => {
              const subDependencyValue = subDependency.getValue();
              const factoryValue = { value: subDependencyValue };
              return factoryValue;
            },
            dependencies: [
              SubDependency,
            ],
          },
        ],
      });

      let testError: Error;
      try {
        await kxModule.create<UseFactoryResult>(depKey);
      } catch (error) {
        testError = error;
      }

      expect(testError.message).to.be.equal(`UseFactoryFunction Dependency. Provided dependency not found! Dependency: "string". Index: 0. Provided dependency: "SubDependency".`);
    });
  });

  it(`should get an instance of UseFactoryClass dependency`, async () => {
    @Dependency()
    class FactoryClass implements Interfaces.FactoryDependencyClass {
      async build (): Promise<number> {
        return 48;
      }
    }
    const depKey = `UseFactoryClassDependency`;

    const kxModule = KxModule.init({
      dependencies: [
        { dependencyKey: depKey, useFactoryClass: FactoryClass },
      ],
    });

    const useValueDependency = await kxModule.get(depKey);
    expect(useValueDependency).to.equal(48);
  });

  it(`should get an instance of UseFactoryFunction dependency`, async () => {
    const depKey = `UseFactoryFunctionDependency`;

    const kxModule = KxModule.init({
      dependencies: [
        {
          dependencyKey: depKey,
          useFactoryFunction: () => {
            return 48;
          },
        },
      ],
    });

    const useValueDependency = await kxModule.get(depKey);
    expect(useValueDependency).to.equal(48);
  });

  it(`should get an instance of UseExisting dependency`, async () => {
    @Dependency()
    class DependencyA {
    }
    @Dependency()
    class DependencyB {
    }

    const kxModule = KxModule.init({
      dependencies: [
        DependencyA,
        { dependencyKey: DependencyB, useExisting: DependencyA },
      ],
    });

    const dependencyA = await kxModule.get(DependencyB);
    expect(dependencyA).not.to.be.an.instanceOf(DependencyB);
    expect(dependencyA).to.be.an.instanceOf(DependencyA);
  });

  it(`should get 2 the instance of one singleton Class dependency and they must be equal`, async () => {
    @Dependency()
    class MainDependency {
    }

    const kxModule = KxModule.init({
      dependencies: [
        MainDependency,
      ],
    });

    const mainDependencyGet1 = await kxModule.get(MainDependency);
    const mainDependencyGet2 = await kxModule.get(MainDependency);
    expect(mainDependencyGet1).to.be.equal(mainDependencyGet2);
  });

  it(`should get 2 the instance of one non-singleton Class dependency and they mustn't be equal`, async () => {
    @Dependency({ singletone: false })
    class MainDependency {
    }

    const kxModule = KxModule.init({
      dependencies: [
        MainDependency,
      ],
    });

    const mainDdependencyGet1 = await kxModule.get(MainDependency);
    const mainDependencyGet2 = await kxModule.get(MainDependency);
    expect(mainDdependencyGet1).not.to.be.equal(mainDependencyGet2);
  });

  it(`should: M->S. Get: M. M.S isn't an undefined`, async () => {
    @Dependency()
    class SubDependency {
    }
    @Dependency()
    class MainDependency {
      constructor (
        public subDependency: SubDependency,
      ) {
      }
    }

    const kxModule = KxModule.init({
      dependencies: [
        SubDependency,
        MainDependency,
      ],
    });

    const mainDependency = await kxModule.get<MainDependency>(MainDependency);
    expect(mainDependency.subDependency).not.to.be.undefined;
  });

  it(`should: M->S. Get: S, M. M.S is equal to S`, async () => {
    @Dependency()
    class SubDependency {
    }
    @Dependency()
    class MainDependency {
      constructor (
        public subDependency: SubDependency,
      ) {
      }
    }

    const kxModule = KxModule.init({
      dependencies: [
        SubDependency,
        MainDependency,
      ],
    });

    const subDependency = await kxModule.get<SubDependency>(SubDependency);
    const mainDependency = await kxModule.get<MainDependency>(MainDependency);
    expect(mainDependency.subDependency).to.be.equal(subDependency);
  });

  it(`should: M->S. Get: M, S. M.S is equal to S`, async () => {
    @Dependency()
    class SubDependency {
    }
    @Dependency()
    class MainDependency {
      constructor (
        public subDependency: SubDependency,
      ) {
      }
    }

    const kxModule = KxModule.init({
      dependencies: [
        SubDependency,
        MainDependency,
      ],
    });

    const mainDependency = await kxModule.get<MainDependency>(MainDependency);
    const subDependency = await kxModule.get<SubDependency>(SubDependency);
    expect(mainDependency.subDependency).to.be.equal(subDependency);
  });

  it(`should: M->S1, M->S2. Get: M, S1, S2. M.S1 is equal to S1, M.S2 is equal to S2`, async () => {
    @Dependency()
    class SubDependency1 {
    }
    @Dependency()
    class SubDependency2 {
    }
    @Dependency()
    class MainDependency {
      constructor (
        public subDependency1: SubDependency1,
        public subDependency2: SubDependency2,
      ) {
      }
    }

    const kxModule = KxModule.init({
      dependencies: [
        SubDependency1,
        SubDependency2,
        MainDependency,
      ],
    });

    const mainDependency = await kxModule.get<MainDependency>(MainDependency);
    const subDependency1 = await kxModule.get<SubDependency1>(SubDependency1);
    const subDependency2 = await kxModule.get<SubDependency2>(SubDependency2);
    expect(mainDependency.subDependency1).to.be.equal(subDependency1);
    expect(mainDependency.subDependency2).to.be.equal(subDependency2);
  });
});
