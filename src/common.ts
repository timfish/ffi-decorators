/** Interface for target class constructor */
export interface ITargetConstructor<T> {
  new (path: string): T;
}

export type TargetClassDecorator<T> = (target: ITargetConstructor<T>) => void;

/**
 * For use in proxied methods to fix compile time errors and warn if
 * proxying ever fails
 */
export function never(): never {
  throw new Error("This method should have been proxied");
}

/**
 * node-ffi type mappings in the format `[returnType, paramTypes]`
 *
 * Example: `['int', ['short', 'pointer']]`
 */
export type FFITypeList = [string, string[]];
