// tslint:disable-next-line:no-implicit-dependencies
import * as ref from 'ref-napi';

/** Interface for target class constructor */
export type ITargetConstructor<T> = new (path: string) => T;

export type TargetClassDecorator<T> = (target: ITargetConstructor<T>) => void;

/**
 * For use in proxied methods to fix compile time errors and warn if
 * proxying ever fails
 */
export function never(): never {
  throw new Error('This method should have been proxied');
}

/**
 * node-ffi type mappings in the format `[returnType, paramTypes]`
 *
 * Example: `['int', ['short', 'pointer']]`
 */
export type FFITypeList = [string | ref.Type, (string | ref.Type)[]];
