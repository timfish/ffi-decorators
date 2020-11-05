import * as debug from 'debug';
import * as ffi from 'ffi-napi';
import { ITargetConstructor, TargetClassDecorator } from './common';
import { getMethodDescriptors, IMethodDescriptors } from './loader';

const log = debug('ffi-decorators:proxy');

/**
 * Class used to proxy calls to ffi
 */
export class FFIProxy<T extends { [key: string]: any }> implements ProxyHandler<T> {
  private readonly native: { [method: string]: ffi.ForeignFunction } | undefined;

  private constructor(private readonly proxied: IMethodDescriptors, path: string) {
    if (Object.keys(this.proxied.mappings).length) {
      this.native = ffi.Library(path, this.proxied.mappings);
    }
  }

  /**
   * @inheritDoc
   */
  public get(target: T, propKey: PropertyKey): any {
    const key = propKey.toString();

    if (this.proxied.proxyMethods.has(key)) {
      const proxiedMethod = this.proxied.proxyMethods.get(key);

      const native = this.native;
      return proxiedMethod && native
        ? (...args: any[]) => proxiedMethod(native, args)
        : target[key];
    } else {
      return target[key];
    }
  }

  /**
   * Creates a proxied class instance
   *
   * @param target Target class constructor
   * @param [libPath] Optional path to library
   */
  public static create<T extends object>(
    target: ITargetConstructor<T>,
    libPath?: string
  ): TargetClassDecorator<T> {
    log('Create', target.name, libPath);

    // tslint:disable-next-line:only-arrow-functions
    const f = function(...args: any[]): any {
      const instance = Reflect.construct(target, args);
      Object.setPrototypeOf(instance, target.prototype);

      if (libPath === undefined) {
        if (args.length === 0 || typeof args[0] !== 'string') {
          throw Error(`Could not create '${target.name}' without valid library path`);
        }
      }

      const descriptors = getMethodDescriptors(target, instance);

      return new Proxy<T>(instance, new FFIProxy(descriptors, libPath || args[0]));
    };

    return f;
  }
}
