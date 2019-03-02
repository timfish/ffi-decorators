// tslint:disable
import { expect, should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { Library, Method, never } from "../";
import { join } from "path";

should();
use(chaiAsPromised);

@Library()
class Testing {
  constructor(path: string) {
    //
  }

  @Method({ types: ["int", ["int"]] })
  public ExportedFunction(input: number): number {
    return never();
  }
}

describe("Basic Test", () => {
  it("Call method on library", () => {
    const libPath = join(__dirname, "build", "Release", "ffi_tests");
    const testing = new Testing(libPath);
    const result = testing.ExportedFunction(4);
    expect(result).to.equal(8);
  });
});
