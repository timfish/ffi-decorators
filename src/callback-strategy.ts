import * as ffi from "ffi";
import { FFITypeList } from "./common";

/** Base callback strategy */
export abstract class CallbackStrategy {
  public constructor(public types: FFITypeList) {}

  protected getWrappedCallback(
    scope: any,
    func: (...args: any[]) => any
  ): Buffer {
    const [ret, param] = this.types;

    // tslint:disable-next-line:only-arrow-functions
    return ffi.Callback(ret, param, function(...args: any[]): any {
      return func.apply(scope, args);
    });
  }

  /** Get a callback pointer for this strategy */
  public abstract getCallback(func: (...args: any[]) => any): Buffer;
  /** Notify the strategy that the callback has been called */
  public callbackCalled?(): void;
}

/**
 * Keep the callback pointer forever
 *
 * This will obviously leak memory but might be more suitable in some cases
 */
export class ForeverStrategy extends CallbackStrategy {
  private readonly callbacks: Buffer[] = [];

  public getCallback(func: (...args: any[]) => any): Buffer {
    const callback = super.getWrappedCallback(this, func);
    this.callbacks.push(callback);
    return callback;
  }
}

/**
 * Keep the callback pointer until another callback is supplied
 */
export class ReplaceStrategy extends CallbackStrategy {
  private callback: Buffer | undefined;

  public getCallback(func: (...args: any[]) => any): Buffer {
    return (this.callback = super.getWrappedCallback(this, func));
  }
}

/**
 * Keep the callback pointer until the callback is called or another is supplied
 */
export class UntilCalledStrategy extends CallbackStrategy {
  private callback: Buffer | undefined;

  public getCallback(func: (...args: any[]) => any): Buffer {
    return (this.callback = super.getWrappedCallback(this, func));
  }

  public callbackCalled?(): void {
    this.callback = undefined;
  }
}

/** To enforce callback strategy constructors */
export interface ICallbackStrategyConstructor {
  new (types: FFITypeList): CallbackStrategy;
}

// tslint:disable:variable-name

/**
 * Available callback caching strategies
 */
export const Strategy = {
  forever: ForeverStrategy,
  replace: ReplaceStrategy,
  untilCalled: UntilCalledStrategy
};
