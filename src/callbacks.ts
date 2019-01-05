import "reflect-metadata";
import {
  CallbackStrategy,
  ICallbackStrategyConstructor,
  ReplaceStrategy
} from "./callback-strategy";
import { FFITypeList } from "./common";
import { IPlugin, PluginFunctionWrap } from "./plugins";

// tsl
const CALLBACK_META = (i: number) => `ffi-decorators:callback-meta:${i}`;

/** Callback decorator options */
export interface ICallbackOptions {
  /**
   * The node-ffi type mappings used to create the callback pointer
   *
   * Example: `['int', ['short', 'pointer']]`
   */
  types: FFITypeList;

  /**
   * Strategy for holding onto the callback pointer
   */
  strategy?: ICallbackStrategyConstructor;

  /**
   * Calling convention
   */
  abi?: number;
}

/**
 * Used to decorate callback parameters so they automatically
 * get wrapped with ffi.callbacks
 */
export function Callback(options: ICallbackOptions): ParameterDecorator {
  return (target: object, key: string | symbol, index: number) => {
    Reflect.defineMetadata(CALLBACK_META(index), options, target, key);
  };
}

/**
 * Plugin to automatically handle wrapping JavaScript callbacks
 * with ffi.callback pointers
 */
export class CallbackPlugin implements Partial<IPlugin> {
  private readonly strategies: (CallbackStrategy | undefined)[] = [];
  public constructor(
    private readonly target: object,
    private readonly method: string
  ) {}

  /**
   * @inheritDoc
   */
  public modifyMappings(mapping: [string, string[]]): void {
    // loop through the all the args and where they have callback metadata,
    // apply a callback strategy to use
    for (let i = 0; i < mapping[1].length; i++) {
      const options: ICallbackOptions = Reflect.getMetadata(
        CALLBACK_META(i),
        this.target,
        this.method
      );

      if (options) {
        const strategyType = options.strategy || ReplaceStrategy;
        // save the strategy for
        this.strategies[i] = new strategyType(options.types, options.abi);
        // ensure ffi is told this is a pointer type
        mapping[1][i] = "pointer";
      }
    }
  }

  /**
   * @inheritDoc
   */
  public modifyArgs(args: any[]): void {
    for (let i = 0; i < args.length; i++) {
      const strategy = this.strategies[i];
      if (strategy) {
        args[i] = strategy.getCallback(args[i]);
      }
    }
  }

  /**
   * @inheritDoc
   */
  public wrapFunction(func: PluginFunctionWrap): PluginFunctionWrap {
    return (...args: any[]) => {
      const result = func(...args);

      for (const strategy of this.strategies) {
        if (strategy && strategy.callbackCalled) {
          strategy.callbackCalled();
        }
      }

      return result;
    };
  }
}
