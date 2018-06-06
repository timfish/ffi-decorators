import * as ffi from "ffi";
import "reflect-metadata";
import { FFITypeList, ITargetConstructor } from "./common";
import { ILibraryOptions, LIBRARY_META } from "./library";
import { IMethodOptions, METHOD_META } from "./method";
import { PluginCollection } from "./plugins";

export type WrapMethod = (
  native: { [method: string]: ffi.ForeignFunction },
  args: any[]
) => any;

/** Method wrapping descriptors */
export interface IMethodDescriptors {
  /**
   * node-ffi mappings
   */
  mappings: { [method: string]: FFITypeList };
  /**
   * Wrapping functions
   */
  proxyMethods: Map<string, WrapMethod>;
}

/**
 * Gets descriptors for the current object instance
 */
export function getMethodDescriptors<T extends object>(
  target: ITargetConstructor<T>,
  instance: T
): IMethodDescriptors {
  const out: IMethodDescriptors = {
    mappings: {},
    proxyMethods: new Map()
  };

  const libraryMeta: Required<ILibraryOptions> = Reflect.getMetadata(
    LIBRARY_META,
    target
  );

  const jsFunctions = getDecoratedMethods(instance);
  const pluginLoader = new PluginCollection(instance, libraryMeta.plugins);

  for (const jsFuncName of jsFunctions) {
    const plugins = pluginLoader.pluginsForMethod(jsFuncName);

    const methodMeta: Required<IMethodOptions> = Reflect.getMetadata(
      METHOD_META,
      instance,
      jsFuncName
    );

    // Plugins can modify the ffi mappings
    plugins.modifyMappings(methodMeta.types);

    // Append to the node-ffi mappings
    out.mappings[methodMeta.nativeName] = methodMeta.types;

    // Set a proxy method for this function
    out.proxyMethods.set(jsFuncName, (native: any, args: any[]) => {
      // Plugins can modify the ars first
      plugins.modifyArgs(args);

      // They can also wrap the function call
      const nativeFunc = plugins.wrapFunction(native[methodMeta.nativeName]);

      // This is required as node-ffi uses `arguments`
      return args.length > 0 ? nativeFunc(...args) : nativeFunc();
    });
  }

  return out;
}

function getDecoratedMethods(obj: any): string[] {
  const out: string[] = [];
  for (const key in obj) {
    if (
      key &&
      typeof obj[key] === "function" &&
      Reflect.getMetadata(METHOD_META, obj, key)
    ) {
      out.push(key);
    }
  }
  return out;
}
