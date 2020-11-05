// tslint:disable
import { expect, should, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Library, Method, never } from '../';
import { join } from 'path';

should();
use(chaiAsPromised);

const libPath = join(__dirname, 'build', 'Release', 'ffi_tests');

@Library()
class Testing {
  constructor(path: string) {
    //
  }

  @Method({ types: ['int', ['int']] })
  public ExportedFunction(input: number): number {
    return never();
  }
}

@Library()
class Testing2 extends Testing {
  constructor(path: string) {
    super(path);
  }

  @Method({ types: ['int', ['int']] })
  public ExportedFunction2(input: number): number {
    return never();
  }
}

describe('Basic Tests', () => {
  it('Call method on library', () => {
    const testing = new Testing(libPath);
    const result = testing.ExportedFunction(4);
    expect(result).to.equal(8);
  });

  it('Call method on library with inheritance', () => {
    const testing = new Testing2(libPath);
    const result = testing.ExportedFunction(4);
    expect(result).to.equal(8);
    const result1 = testing.ExportedFunction2(4);
    expect(result1).to.equal(16);
  });
});
