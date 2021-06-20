/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
// import * as sinon from 'sinon';
import * as _ from 'lodash';
import 'reflect-metadata';

import { Dependency } from '../dist/decorators';
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

  it(`should create an instance of class dependency`, async () => {
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
    class DependencyA {
    }

    const kxModule = KxModule.init({
      dependencies: [
        DependencyA,
      ],
    });

    const dependencyAGet1 = await kxModule.get(DependencyA);
    const dependencyAGet2 = await kxModule.get(DependencyA);
    expect(dependencyAGet1).to.be.equal(dependencyAGet2);
  });

  it(`should get 2 the instance of one non-singleton Class dependency and they mustn't be equal`, async () => {
    @Dependency({ singletone: false })
    class DependencyA {
    }

    const kxModule = KxModule.init({
      dependencies: [
        DependencyA,
      ],
    });

    const dependencyAGet1 = await kxModule.get(DependencyA);
    const dependencyAGet2 = await kxModule.get(DependencyA);
    expect(dependencyAGet1).not.to.be.equal(dependencyAGet2);
  });

  it(`should get B: B->A. Calls: B`, async () => {
    @Dependency()
    class DependencyA {
    }
    @Dependency()
    class DependencyB {
      constructor (
        public dependencyA: DependencyA,
      ) {
      }
    }

    const kxModule = KxModule.init({
      dependencies: [
        DependencyA,
        DependencyB,
      ],
    });

    const dependencyB = await kxModule.get<DependencyB>(DependencyB);
    expect(dependencyB.dependencyA).not.to.be.undefined;
  });

  it(`should get B: B->A. Calls: A, B`, async () => {
    @Dependency()
    class DependencyA {
    }
    @Dependency()
    class DependencyB {
      constructor (
        public dependencyA: DependencyA,
      ) {
      }
    }

    const kxModule = KxModule.init({
      dependencies: [
        DependencyA,
        DependencyB,
      ],
    });

    const dependencyA = await kxModule.get<DependencyA>(DependencyA);
    const dependencyB = await kxModule.get<DependencyB>(DependencyB);
    expect(dependencyB.dependencyA).to.be.equal(dependencyA);
  });

  it(`should get B: B->A. Calls: B, A.`, async () => {
    @Dependency()
    class DependencyA {
    }
    @Dependency()
    class DependencyB {
      constructor (
        public dependencyA: DependencyA,
      ) {
      }
    }

    const kxModule = KxModule.init({
      dependencies: [
        DependencyA,
        DependencyB,
      ],
    });

    const dependencyB = await kxModule.get<DependencyB>(DependencyB);
    const dependencyA = await kxModule.get<DependencyA>(DependencyA);
    expect(dependencyB.dependencyA).to.be.equal(dependencyA);
  });
});
