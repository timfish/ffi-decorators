import "reflect-metadata";
import { CallbackPlugin } from "./callbacks";
import { ITargetConstructor, TargetClassDecorator } from "./common";
import { IPluginConstructor } from "./plugins";
import { PromisePlugin } from "./promises";
import { FFIProxy } from "./proxy";

export const LIBRARY_META = "ffi-decorators:library-meta";

/** Library decorator options */
export interface ILibraryOptions {
  /**
   * Optional path or name of the library.
   *
   * If this is not supplied, the library path or name must be supplied as
   * the first constructor argument
   */
  libPath?: string;

  /**
   * Override the plugins used in proxying the class and transforming
   * the arguments.
   *
   * Defaults to `[PromisePlugin, CallbackPlugin]`
   */
  plugins?: IPluginConstructor[];
}

/**
 * Used to automatically proxy native calls on the decorated class
 * @param options options
 */
export function Library<T extends object>(
  options: ILibraryOptions = {}
): TargetClassDecorator<T> {
  return (target: ITargetConstructor<T>) => {
    options.plugins = options.plugins || [PromisePlugin, CallbackPlugin];

    // Define the plugins used later
    Reflect.defineMetadata(LIBRARY_META, options, target);

    // Wrap the class in a proxy
    return FFIProxy.create(target, options.libPath);
  };
}
