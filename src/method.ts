import { FFITypeList } from "./common";

export const METHOD_META = "ffi-decorators:method-meta";

/** Method decorator options */
export interface IMethodOptions {
  /**
   * The node-ffi type mappings used to call the native function
   *
   * Example: `['int', ['short', 'pointer']]`
   */
  types: FFITypeList;
  /**
   * Optional name of the native function to call.
   *
   * If this is not supplied the name of the JavaScript function is used.
   */
  nativeName?: string;
}

/**
 * Used to decorate functions which you want to proxy via node-ffi
 * @param options Method options
 */
export function Method(
  options: IMethodOptions
): (
  target: object,
  key: string,
  descriptor: PropertyDescriptor
) => PropertyDescriptor {
  return (
    target: { [key: string]: any },
    key: string,
    descriptor: PropertyDescriptor
  ) => {
    options.nativeName = options.nativeName || key;
    Reflect.defineMetadata(METHOD_META, options, target, key);
    return descriptor;
  };
}
