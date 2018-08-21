# ffi-decorators
Use [node-ffi](https://github.com/node-ffi/node-ffi) via decorators.

It got tiresome maintaining separate type declarations and mappings for all our `node-ffi` code. This library has made things a little less painful so hopefully it can be useful to others.

It gives you:

- Typed calls to native libraries  
- Automatic 'promisifcation' using the ffi `async` feature
- Automatic handling of callback pointer lifetime

Only tested in TypeScript where you'll need these options enabling in your `tsconfig.json`:

```json
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
  }
```

> **Note:** `ffi` is a peer dependency so you'll need to install a version which is compatible with your node version.

```typescript
import { Callback, Library, Method, never } from 'ffi-decorators';

@Library({ libPath: 'libmylibrary' })
class MyLibrary {
  constructor(path?: string) { }

  @Method({ types: ['double', ['double', 'int']] })
  do_some_number_fudging(a: number, b: number): number {
    return never();
  }

  @Method({ types: ['double', ['double', 'int']] })
  do_long_running_thing(input: number, length: number): Promise<number> {
    return never();
  }

  @Method({ types: ['void', ['short', 'pointer']] })
  something_with_callback(
    handle: number,
    @Callback({ types: ['void', ['int']] })
    cb: (result: number) => void
  ): void {
    return never();
  }

  @Method({ nativeName: 'specific_name', types: ['double', ['double']] })
  whateverYouLike(a: number): number {
    return never();
  }
}

// Create a class instance and native calls are proxied
const myLib = new MyLibrary();
myLib.do_some_number_fudging(10, 546);

// do_long_running_thing returns a promise so 
// this automatically uses the ffi async feature
const result = await myLib.do_long_running_thing(95, 9);

// Callback pointers are cached to avoid GC
myLib.something_with_callback(5, (res) => {
  console.log(res);
})

// This will actually call specific_name
myLib.whateverYouLike(16);

// Optionally supply the full path to your library
const myLib = new MyLibrary('path/to/libmylibrary');
```
