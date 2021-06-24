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
    it(`should create an instance of Class dependency`, async () => {
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
      expect(testError.message).to.be.equal(`Class Dependency. Dependency in constructor not found! Class: "MainDependency". Index: 0. Dependency: "SubDependency".`);
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
      expect(testError.message).to.be.equal(`Class Dependency. Dependency in property not found! Class: "MainDependency". Property: "subDependency". Dependency: "SubDependency".`);
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
      expect(testError.message).to.be.equal(`Class Dependency. Constructor doesn't support native types! Class: "MainDependency". Index: 0. Dependency: "string".`);
    });
  });


  it(`should get an instance of Class dependency`, async () => {
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

  it(`should get an instance of UseClass dependency`, async () => {
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

  it(`should get an instance of UseValue dependency`, async () => {
    const depKey = `UseValueDependency`;

    const kxModule = KxModule.init({
      dependencies: [
        { dependencyKey: depKey, useValue: 48 },
      ],
    });

    const useValueDependency = await kxModule.get(depKey);
    expect(useValueDependency).to.equal(48);
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
