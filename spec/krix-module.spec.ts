/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
// import * as sinon from 'sinon';
import 'reflect-metadata';

import { KxModule, Dependency, Inject } from '../dist';
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

  describe(`create/get`, () => {
    it(`create should throw an error if dependency not found`, async () => {
      @Dependency()
      class DependencyA {
      }
      @Dependency()
      class DependencyB {
      }

      const moduleA = KxModule.init({
        dependencies: [
          DependencyA,
        ],
        export: [
          DependencyA,
        ],
      });

      let testError: Error;
      try {
        await moduleA.create(DependencyB);
      } catch (error) {
        testError = error as Error;
      }

      expect(testError.message).to.be.equal(`Can't create the dependency: "DependencyB". Dependency not found.`);
    });

    it(`get should throw an error if dependency not found`, async () => {
      @Dependency()
      class DependencyA {
      }
      @Dependency()
      class DependencyB {
      }

      const moduleA = KxModule.init({
        dependencies: [
          DependencyA,
        ],
        export: [
          DependencyA,
        ],
      });

      let testError: Error;
      try {
        await moduleA.get(DependencyB);
      } catch (error) {
        testError = error as Error;
      }

      expect(testError.message).to.be.equal(`Can't get the dependency: "DependencyB". Dependency not found.`);
    });
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

      const mainDependency = await kxModule.create(MainDependency);
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

      const mainDependency = await kxModule.create(MainDependency);
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

      const mainDependency = await kxModule.create(MainDependency);
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
        await kxModule.create(MainDependency);
      } catch (error) {
        testError = error as Error;
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
        await kxModule.create(MainDependency);
      } catch (error) {
        testError = error as Error;
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

        await kxModule.create(MainDependency);
      } catch (error) {
        testError = error as Error;
      }

      expect(testError).not.to.be.undefined;
      expect(testError.message).to.be.equal(`Class Dependency. Constructor doesn't support native types! Dependency: "MainDependency". Index: 0. Provided dependency: "string".`);
    });

    it(`'create' should create a new dependency with the UseValue external subdependency`, async () => {
      const subDependencyValue = 43;
      @Dependency()
      class SubDependency {
        test () {
          return subDependencyValue;
        }
      }

      const externalDependencyValue = 51;
      @Dependency()
      class ExternalSubDependency {
        test () {
          return externalDependencyValue;
        }
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
          ExternalSubDependency,
          MainDependency,
        ],
      });

      const mainDependency1 = await kxModule.create(MainDependency);
      expect(mainDependency1.subDependency).not.to.be.undefined;
      expect(mainDependency1.subDependency.test()).to.be.equal(subDependencyValue);

      const externalSubDependency = await kxModule.create(ExternalSubDependency);
      const mainDependency2 = await kxModule.create(MainDependency, [
        {
          dependencyKey: SubDependency,
          useValue: externalSubDependency,
        },
      ]);
      expect(mainDependency2.subDependency).not.to.be.undefined;
      expect(mainDependency2.subDependency.test()).to.be.equal(externalDependencyValue);
    });

    it(`'create' should create a new dependency with the UseExisting external subdependency`, async () => {
      const subDependencyValue = 43;
      @Dependency()
      class SubDependency {
        test () {
          return subDependencyValue;
        }
      }

      const externalDependencyValue = 51;
      @Dependency()
      class ExternalSubDependency {
        test () {
          return externalDependencyValue;
        }
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
          ExternalSubDependency,
          MainDependency,
        ],
      });

      const mainDependency1 = await kxModule.create(MainDependency);
      expect(mainDependency1.subDependency).not.to.be.undefined;
      expect(mainDependency1.subDependency.test()).to.be.equal(subDependencyValue);

      const mainDependency2 = await kxModule.create(MainDependency, [
        {
          dependencyKey: SubDependency,
          useExisting: ExternalSubDependency,
        },
      ]);
      expect(mainDependency2.subDependency).not.to.be.undefined;
      expect(mainDependency2.subDependency.test()).to.be.equal(externalDependencyValue);
    });

    it(`'create' should create a new dependency with Module dependency`, async () => {
      @Dependency()
      class MainDependency {
        constructor (
          public kxModule: KxModule,
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          MainDependency,
        ],
      });

      const mainDependency = await kxModule.create(MainDependency);
      expect(mainDependency).to.be.an.instanceOf(MainDependency);
      expect(mainDependency.kxModule).not.to.be.undefined;
      expect(mainDependency.kxModule).to.be.an.instanceOf(KxModule);
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

      const mainDependency = await kxModule.create(MainDependency);
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
        await kxModule.create(MainDependency);
      } catch (error) {
        testError = error as Error;
      }

      expect(testError.message).to.be.equal(`UseClass Dependency. Provided dependency not found! Dependency: "MainDependency". Index: 0. Provided dependency: "SubDependency".`);
    });

    it(`'create' should create a new dependency with the UseValue external subdependency`, async () => {
      const subDependencyValue = 43;
      @Dependency()
      class SubDependency {
        test () {
          return subDependencyValue;
        }
      }

      const externalDependencyValue = 51;
      @Dependency()
      class ExternalSubDependency {
        test () {
          return externalDependencyValue;
        }
      }

      class MainDependency {
        constructor (
          public subDependency: SubDependency,
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          SubDependency,
          ExternalSubDependency,
          {
            dependencyKey: MainDependency,
            useClass: MainDependency,
            dependencies: [
              SubDependency,
            ],
          },
        ],
      });

      const mainDependency1 = await kxModule.create(MainDependency);
      expect(mainDependency1.subDependency).not.to.be.undefined;
      expect(mainDependency1.subDependency.test()).to.be.equal(subDependencyValue);

      const externalSubDependency = await kxModule.create(ExternalSubDependency);
      const mainDependency2 = await kxModule.create(MainDependency, [
        {
          dependencyKey: SubDependency,
          useValue: externalSubDependency,
        },
      ]);
      expect(mainDependency2.subDependency).not.to.be.undefined;
      expect(mainDependency2.subDependency.test()).to.be.equal(externalDependencyValue);
    });

    it(`'create' should create a new dependency with the UseExisting external subdependency`, async () => {
      const subDependencyValue = 43;
      @Dependency()
      class SubDependency {
        test () {
          return subDependencyValue;
        }
      }

      const externalDependencyValue = 51;
      @Dependency()
      class ExternalSubDependency {
        test () {
          return externalDependencyValue;
        }
      }

      class MainDependency {
        constructor (
          public subDependency: SubDependency,
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          SubDependency,
          ExternalSubDependency,
          {
            dependencyKey: MainDependency,
            useClass: MainDependency,
            dependencies: [
              SubDependency,
            ],
          },
        ],
      });

      const mainDependency1 = await kxModule.create(MainDependency);
      expect(mainDependency1.subDependency).not.to.be.undefined;
      expect(mainDependency1.subDependency.test()).to.be.equal(subDependencyValue);

      const mainDependency2 = await kxModule.create(MainDependency, [
        {
          dependencyKey: SubDependency,
          useExisting: ExternalSubDependency,
        },
      ]);
      expect(mainDependency2.subDependency).not.to.be.undefined;
      expect(mainDependency2.subDependency.test()).to.be.equal(externalDependencyValue);
    });

    it(`'create' should create a new dependency with Module dependency`, async () => {
      class MainDependency {
        constructor (
          public kxModule: KxModule,
        ) {}
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: MainDependency,
            useClass: MainDependency,
            dependencies: [
              KxModule,
            ],
          },
        ],
      });

      const mainDependency = await kxModule.create(MainDependency);
      expect(mainDependency).to.be.an.instanceOf(MainDependency);
      expect(mainDependency.kxModule).not.to.be.undefined;
      expect(mainDependency.kxModule).to.be.an.instanceOf(KxModule);
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

    it(`should create a dependency with constructor dependency`, async () => {
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
        testError = error as Error;
      }

      expect(testError.message).to.be.equal(`UseFactoryFunction Dependency. Provided dependency not found! Dependency: "string". Index: 0. Provided dependency: "SubDependency".`);
    });

    it(`'create' should create a new dependency with the UseValue external subdependency`, async () => {
      const depKey = `UseFactoryFunctionDependency`;
      const subDependencyValue = 43;
      @Dependency()
      class SubDependency {
        test () {
          return subDependencyValue;
        }
      }

      const externalDependencyValue = 51;
      @Dependency()
      class ExternalSubDependency {
        test () {
          return externalDependencyValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          SubDependency,
          ExternalSubDependency,
          {
            dependencyKey: depKey,
            useFactoryFunction: (subDependency: SubDependency) => {
              return subDependency.test();
            },
            dependencies: [
              SubDependency,
            ],
          },
        ],
      });

      const useFactoryFunctionDependency1 = await kxModule.create<number>(depKey);
      expect(useFactoryFunctionDependency1).to.be.equal(subDependencyValue);

      const externalSubDependency = await kxModule.create(ExternalSubDependency);
      const useFactoryFunctionDependency2 = await kxModule.create<number>(depKey, [
        {
          dependencyKey: SubDependency,
          useValue: externalSubDependency,
        },
      ]);
      expect(useFactoryFunctionDependency2).to.be.equal(externalDependencyValue);
    });

    it(`'create' should create a new dependency with the UseExisting external subdependency`, async () => {
      const depKey = `UseFactoryFunctionDependency`;
      const subDependencyValue = 43;
      @Dependency()
      class SubDependency {
        test () {
          return subDependencyValue;
        }
      }

      const externalDependencyValue = 51;
      @Dependency()
      class ExternalSubDependency {
        test () {
          return externalDependencyValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          SubDependency,
          ExternalSubDependency,
          {
            dependencyKey: depKey,
            useFactoryFunction: (subDependency: SubDependency) => {
              return subDependency.test();
            },
            dependencies: [
              SubDependency,
            ],
          },
        ],
      });

      const useFactoryFunctionDependency1 = await kxModule.create<number>(depKey);
      expect(useFactoryFunctionDependency1).to.be.equal(subDependencyValue);

      const useFactoryFunctionDependency2 = await kxModule.create<number>(depKey, [
        {
          dependencyKey: SubDependency,
          useExisting: ExternalSubDependency,
        },
      ]);
      expect(useFactoryFunctionDependency2).to.be.equal(externalDependencyValue);
    });

    it(`'create' should call a factory function with Module dependency`, async () => {
      const depKey = `UseFactoryFunctionDependency`;
      const factoryValue = 42;

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryFunction: (injectedKxModule: KxModule) => {
              expect(injectedKxModule).not.to.be.undefined;
              expect(injectedKxModule).to.be.an.instanceOf(KxModule);
              return factoryValue;
            },
            dependencies: [
              KxModule,
            ],
          },
        ],
      });

      const useFactoryFunctionDependency1 = await kxModule.create<number>(depKey);
      expect(useFactoryFunctionDependency1).to.be.equal(factoryValue);
    });
  });

  describe(`UseFactoryClass dependency`, () => {
    it(`'create' should create a new instance`, async () => {
      const depKey = `UseFactoryClassDependency`;
      const factoryValue = {};

      @Dependency()
      class FactoryClass implements Interfaces.FactoryClassDependency {
        build () {
          return factoryValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryClass: FactoryClass,
          },
        ],
      });

      const useFactoryClassDependency = await kxModule.create(depKey);
      expect(useFactoryClassDependency).to.be.equal(factoryValue);
    });

    it(`two 'create' should return 2 different instance of dependency`, async () => {
      const depKey = `UseFactoryClassDependency`;

      @Dependency()
      class FactoryClass implements Interfaces.FactoryClassDependency {
        build () {
          const factoryValue = {};
          return factoryValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryClass: FactoryClass,
          },
        ],
      });

      const useFactoryClassDependency1 = await kxModule.create(depKey);
      const useFactoryClassDependency2 = await kxModule.create(depKey);
      expect(useFactoryClassDependency1).not.to.be.equal(useFactoryClassDependency2);
    });

    it(`'get' should create a new instance and return it`, async () => {
      const depKey = `UseFactoryClassDependency`;

      const factoryValue = {};
      @Dependency()
      class FactoryClass implements Interfaces.FactoryClassDependency {
        build () {
          return factoryValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryClass: FactoryClass,
          },
        ],
      });

      const useFactoryClassDependency = await kxModule.get(depKey);
      expect(useFactoryClassDependency).to.be.equal(factoryValue);
    });

    it(`two 'get' should return one instance (singleton)`, async () => {
      const depKey = `UseFactoryClassDependency`;

      @Dependency()
      class FactoryClass implements Interfaces.FactoryClassDependency {
        build () {
          const factoryValue = {};
          return factoryValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryClass: FactoryClass,
          },
        ],
      });

      const useFactoryClassDependency1 = await kxModule.get(depKey);
      const useFactoryClassDependency2 = await kxModule.get(depKey);
      expect(useFactoryClassDependency1).to.be.equal(useFactoryClassDependency2);
    });

    it(`two 'get' should return two different instances (non-singleton)`, async () => {
      const depKey = `UseFactoryClassDependency`;

      @Dependency()
      class FactoryClass implements Interfaces.FactoryClassDependency {
        build () {
          const factoryValue = {};
          return factoryValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryClass: FactoryClass,
            singletone: false,
          },
        ],
      });

      const useFactoryClassDependency1 = await kxModule.get(depKey);
      const useFactoryClassDependency2 = await kxModule.get(depKey);
      expect(useFactoryClassDependency1).not.to.be.equal(useFactoryClassDependency2);
    });

    it(`'create' should return a new instance which doesn't equal instance from 'get'`, async () => {
      const depKey = `UseFactoryClassDependency`;

      @Dependency()
      class FactoryClass implements Interfaces.FactoryClassDependency {
        build () {
          const factoryValue = {};
          return factoryValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryClass: FactoryClass,
          },
        ],
      });

      const useFactoryClassCreate = await kxModule.create(depKey);
      const useFactoryClassGet = await kxModule.get(depKey);
      expect(useFactoryClassCreate).not.to.be.equal(useFactoryClassGet);
    });

    it(`should create an async dependency`, async () => {
      const depKey = `UseFactoryClassDependency`;

      const factoryValue = 42;
      @Dependency()
      class FactoryClass implements Interfaces.FactoryClassDependency {
        async build () {
          const factoryValueResult = await Promise.resolve(factoryValue);
          return factoryValueResult;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryClass: FactoryClass,
          },
        ],
      });

      const useFactoryClassDependency = await kxModule.create(depKey);
      expect(useFactoryClassDependency).to.be.equal(factoryValue);
    });

    it(`should create a factory class dependency with constructor dependency`, async () => {
      const initialSubDependencyValue = {};
      @Dependency()
      class SubDependency {
        getValue () {
          return initialSubDependencyValue;
        }
      }

      interface UseFactoryResult {
        value: object;
      }

      const depKey = `UseFactoryClassDependency`;

      @Dependency()
      class FactoryClass implements Interfaces.FactoryClassDependency {
        constructor (
          public subDependency: SubDependency,
        ) {
        }

        build (): UseFactoryResult {
          const subDependencyValue = this.subDependency.getValue();
          const factoryValue = { value: subDependencyValue };
          return factoryValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryClass: FactoryClass,
          },
          SubDependency,
        ],
      });

      const useFactoryFunctionDependency = await kxModule.create<UseFactoryResult>(depKey);
      expect(useFactoryFunctionDependency.value).to.be.equal(initialSubDependencyValue);
    });

    it(`should throw an error if dependency in constructor of factory class isn't provided in module definition`, async () => {
      const initialSubDependencyValue = {};
      @Dependency()
      class SubDependency {
        getValue () {
          return initialSubDependencyValue;
        }
      }

      interface UseFactoryResult {
        value: object;
      }

      const depKey = `UseFactoryClassDependency`;

      @Dependency()
      class FactoryClass implements Interfaces.FactoryClassDependency {
        constructor (
          public subDependency: SubDependency,
        ) {
        }

        build (): UseFactoryResult {
          const subDependencyValue = this.subDependency.getValue();
          const factoryValue = { value: subDependencyValue };
          return factoryValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryClass: FactoryClass,
          },
        ],
      });

      let testError: Error;
      try {
        await kxModule.create<UseFactoryResult>(depKey);
      } catch (error) {
        testError = error as Error;
      }

      expect(testError.message).to.be.equal(`Class Dependency. Dependency in constructor not found! Dependency: "FactoryClass". Index: 0. Provided dependency: "SubDependency".`);
    });

    it(`'create' should create a factory class with Module dependency`, async () => {
      const depKey = `UseFactoryClassDependency`;
      const factoryValue = 42;
      @Dependency()
      class FactoryClass implements Interfaces.FactoryClassDependency {
        constructor (
          public kxModule: KxModule,
        ) {
        }

        build (): number {
          expect(this.kxModule).not.to.be.undefined;
          expect(this.kxModule).to.be.an.instanceOf(KxModule);

          return factoryValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          {
            dependencyKey: depKey,
            useFactoryClass: FactoryClass,
          },
        ],
      });

      const useFactoryClassDependency = await kxModule.create(depKey);
      expect(useFactoryClassDependency).to.be.equal(factoryValue);
    });
  });

  describe(`UseExisting dependency`, () => {
    it(`'create' of dependency A should create a new instance of dependency B`, async () => {
      @Dependency()
      class DependencyA {
        test (): number {
          return 23;
        }
      }

      const dependencyBValue = 51;
      @Dependency()
      class DependencyB {
        test (): number {
          return dependencyBValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
          DependencyB,
          { dependencyKey: DependencyA, useExisting: DependencyB },
        ],
      });

      const dependencyA = await kxModule.create(DependencyA);
      expect(dependencyA).to.be.an.instanceOf(DependencyB);
      expect(dependencyA.test()).to.be.equal(dependencyBValue);
    });

    it(`two 'create' of dependency A should return the same instance of dependency B`, async () => {
      @Dependency()
      class DependencyA {
        test (): number {
          return 23;
        }
      }

      const dependencyBValue = 51;
      @Dependency()
      class DependencyB {
        test (): number {
          return dependencyBValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
          DependencyB,
          { dependencyKey: DependencyA, useExisting: DependencyB },
        ],
      });

      const dependencyCreateA1 = await kxModule.create(DependencyA);
      const dependencyCreateA2 = await kxModule.create(DependencyA);
      expect(dependencyCreateA1).to.be.equal(dependencyCreateA2);
    });

    it(`'get' of dependency A should create a new instance of dependency B and return it`, async () => {
      @Dependency()
      class DependencyA {
        test (): number {
          return 23;
        }
      }

      const dependencyBValue = 51;
      @Dependency()
      class DependencyB {
        test (): number {
          return dependencyBValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
          DependencyB,
          { dependencyKey: DependencyA, useExisting: DependencyB },
        ],
      });

      const dependencyA = await kxModule.get(DependencyA);
      expect(dependencyA).to.be.an.instanceOf(DependencyB);
      expect(dependencyA.test()).to.be.equal(dependencyBValue);
    });

    it(`two 'get' of dependency A should return one instance of dependency B (singleton)`, async () => {
      @Dependency()
      class DependencyA {
        test (): number {
          return 23;
        }
      }

      const dependencyBValue = 51;
      @Dependency()
      class DependencyB {
        test (): number {
          return dependencyBValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
          DependencyB,
          { dependencyKey: DependencyA, useExisting: DependencyB },
        ],
      });

      const dependencyGetA1 = await kxModule.get(DependencyA);
      const dependencyGetA2 = await kxModule.get(DependencyA);
      expect(dependencyGetA1).to.be.equal(dependencyGetA2);
      expect(dependencyGetA2).to.be.an.instanceOf(DependencyB);
    });

    it(`two 'get' of dependency A should return two different instances of dependency B (non-singleton)`, async () => {
      @Dependency()
      class DependencyA {
        test (): number {
          return 23;
        }
      }

      const dependencyBValue = 51;
      @Dependency({ singletone: false })
      class DependencyB {
        test (): number {
          return dependencyBValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
          DependencyB,
          { dependencyKey: DependencyA, useExisting: DependencyB },
        ],
      });

      const dependencyGetA1 = await kxModule.get(DependencyA);
      const dependencyGetA2 = await kxModule.get(DependencyA);
      expect(dependencyGetA1).not.to.be.equal(dependencyGetA2);
    });

    it(`'create' of dependency A should return a new instance of dependency B (singleton) which equals an instance from 'get'`, async () => {
      @Dependency()
      class DependencyA {
        test (): number {
          return 23;
        }
      }

      const dependencyBValue = 51;
      @Dependency()
      class DependencyB {
        test (): number {
          return dependencyBValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
          DependencyB,
          { dependencyKey: DependencyA, useExisting: DependencyB },
        ],
      });

      const dependencyGetA = await kxModule.get(DependencyA);
      const dependencyCreateA = await kxModule.create(DependencyA);
      expect(dependencyCreateA).to.be.equal(dependencyGetA);
    });

    it(`'create' of dependency A should return a new instance of dependency B (non-singleton) which doesn't equal an instance from 'get'`, async () => {
      @Dependency()
      class DependencyA {
        test (): number {
          return 23;
        }
      }

      const dependencyBValue = 51;
      @Dependency({ singletone: false })
      class DependencyB {
        test (): number {
          return dependencyBValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
          DependencyB,
          { dependencyKey: DependencyA, useExisting: DependencyB },
        ],
      });

      const dependencyGetA = await kxModule.get(DependencyA);
      const dependencyCreateA = await kxModule.create(DependencyA);
      expect(dependencyCreateA).not.to.be.equal(dependencyGetA);
    });

    it(`should throw an error if existing dependency isn't provided in module definition`, async () => {
      @Dependency()
      class DependencyA {
        test (): number {
          return 23;
        }
      }

      const dependencyBValue = 51;
      @Dependency({ singletone: false })
      class DependencyB {
        test (): number {
          return dependencyBValue;
        }
      }

      const kxModule = KxModule.init({
        dependencies: [
          DependencyA,
          { dependencyKey: DependencyA, useExisting: DependencyB },
        ],
      });

      let testError: Error;
      try {
        await kxModule.create(DependencyA);
      } catch (error) {
        testError = error as Error;
      }

      expect(testError.message).to.be.equal(`UseExisting Dependency. Existing dependency not found! Dependency: "DependencyA". Existing dependency: "DependencyB".`);
    });
  });

  describe(`import/export`, () => {
    it(`should create the module if dependency is provided both in the module defenition and the export section`, async () => {
      @Dependency()
      class DependencyA {
      }

      let testError: Error;
      try {
        KxModule.init({
          dependencies: [
            DependencyA,
          ],
          export: [
            DependencyA,
          ],
        });
      } catch (error) {
        testError = error as Error;
      }

      expect(testError).to.be.undefined;
    });

    it(`should throw an error if export dependency isn't provided in module definition, but provided in the export section`, async () => {
      @Dependency()
      class DependencyA {
      }

      let testError: Error;
      try {
        KxModule.init({
          dependencies: [
          ],
          export: [
            DependencyA,
          ],
        });
      } catch (error) {
        testError = error as Error;
      }

      expect(testError.message).to.be.equal(`Can't export non-existing dependency: "DependencyA".`);
    });

    it(`should create the dependency B if the dependency A is provided and exported in the another module`, async () => {
      @Dependency()
      class DependencyA {
      }

      @Dependency()
      class DependencyB {
        constructor (
          public dependencyA: DependencyA,
        ) {}
      }

      const moduleA = KxModule.init({
        dependencies: [
          DependencyA,
        ],
        export: [
          DependencyA,
        ],
      });

      const moduleB = KxModule.init({
        import: [
          moduleA,
        ],
        dependencies: [
          DependencyB,
        ],
      });

      const dependencyB = await moduleB.get(DependencyB);
      expect(dependencyB).not.to.be.undefined;
      expect(dependencyB.dependencyA).not.to.be.undefined;
      expect(dependencyB.dependencyA).to.be.instanceOf(DependencyA);
    });

    it(`should throw an error if the dependency B requires the dependency A from another module, but dependency A isn't exported`, async () => {
      @Dependency()
      class DependencyA {
      }

      @Dependency()
      class DependencyB {
        constructor (
          public dependencyA: DependencyA,
        ) {}
      }

      const moduleA = KxModule.init({
        dependencies: [
          DependencyA,
        ],
        export: [
        ],
      });

      const moduleB = KxModule.init({
        import: [
          moduleA,
        ],
        dependencies: [
          DependencyB,
        ],
      });

      let testError: Error;
      try {
        await moduleB.get(DependencyB);
      } catch (error) {
        testError = error as Error;
      }

      expect(testError.message).to.be.equal(`Class Dependency. Dependency in constructor not found! Dependency: "DependencyB". Index: 0. Provided dependency: "DependencyA".`);
    });

    it(`should create the dependency B if the exported dependency A not found in the first imported module, but it's found in the second one`, async () => {
      @Dependency()
      class DependencyA {
      }

      @Dependency()
      class DependencyB {
        constructor (
          public dependencyA: DependencyA,
        ) {}
      }

      const moduleA = KxModule.init({
        dependencies: [
          DependencyA,
        ],
        export: [
        ],
      });
      const moduleB = KxModule.init({
        dependencies: [
          DependencyA,
        ],
        export: [
          DependencyA,
        ],
      });

      const moduleC = KxModule.init({
        import: [
          moduleA,
          moduleB,
        ],
        dependencies: [
          DependencyB,
        ],
      });

      const dependencyB = await moduleC.get(DependencyB);
      expect(dependencyB).not.to.be.undefined;
      expect(dependencyB.dependencyA).not.to.be.undefined;
      expect(dependencyB.dependencyA).to.be.instanceOf(DependencyA);
    });
  });
});
