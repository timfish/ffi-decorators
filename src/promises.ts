import * as ffi from "ffi";
import "reflect-metadata";
import { IPlugin } from "./plugins";

/**
 * Plugin to automatically call node-ffi async feature when function
 * returns a Promise
 */
export class PromisePlugin implements Partial<IPlugin> {
  private readonly wrapPromise: boolean;

  public constructor(target: object, method: string) {
    this.wrapPromise =
      Reflect.getMetadata("design:returntype", target, method).name ===
      "Promise";
  }

  /**
   * @inheritDoc
   */
  public wrapFunction(func: ffi.ForeignFunction): any {
    return this.wrapPromise
      ? (...args: any[]) =>
          new Promise((resolve, reject) => {
            const cb = (err: Error, res: any) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            };

            if (args.length > 0) {
              func.async(...args, cb);
            } else {
              func.async(cb);
            }
          })
      : func;
  }
}
