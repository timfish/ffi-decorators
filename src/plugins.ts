import { FFITypeList } from "./common";

export type PluginFunctionWrap = (...args: any[]) => PluginFunctionWrap;

/**
 * A simple plugin interface which can be used to transform data or
 * parameters before the native methods are called
 */
export interface IPlugin {
  /**
   * Used by plugins to read or modify the node-ffi mappings
   */
  modifyMappings(mapping: FFITypeList): void;

  /**
   * Used by plugins to read or modify the arguments before the
   * native method is called
   */
  modifyArgs(args: any[]): void;

  /**
   * Used by plugins to to wrap the execution of the native method
   */
  wrapFunction(func: PluginFunctionWrap): PluginFunctionWrap;
}

/** Interface to type plugin constructors */
export interface IPluginConstructor {
  new (target: object, method: string): Partial<IPlugin>;
}

/**
 * Aggregates plugins and simplifies calling their methods
 */
export class PluginCollection {
  public constructor(
    private readonly target: object,
    private readonly pluginsConstructors: IPluginConstructor[]
  ) {}

  /** Gets plugin instances for the supplied method */
  public pluginsForMethod(method: string): IPlugin {
    const plugins = this.pluginsConstructors.map(
      p => new p(this.target, method)
    );

    return {
      modifyMappings(mapping: FFITypeList): void {
        plugins.forEach(plugin => {
          if (plugin.modifyMappings) {
            plugin.modifyMappings(mapping);
          }
        });
      },
      modifyArgs(args: any[]): void {
        plugins.forEach(plugin => {
          if (plugin.modifyArgs) {
            plugin.modifyArgs(args);
          }
        });
      },
      wrapFunction(funcNative: PluginFunctionWrap): PluginFunctionWrap {
        return plugins.reduce(
          (func, plugin) =>
            plugin.wrapFunction ? plugin.wrapFunction(func) : func,
          funcNative as (...args: any[]) => any
        );
      }
    };
  }
}
