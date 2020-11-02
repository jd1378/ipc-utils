# ipc-utils

makes using child_process using fork easy

## Info

Read the changelogs [here](https://github.com/jd1378/ipc-utils/blob/master/CHANGELOG.md)

### A note on usage

for using `setupComlink`, you have to bind `this` to the method, so it knows where to look for functions and properties when the proxy is accessed. if you don't, it will lookup `global` by default (or whatever `this` refers to in that context I guess, so don't do guess work and always bind). after calling `setupComlink` it will return a proxy which you can use it to access your child process properties and methods. currently you should call both functions and properties as methods for it to work.

for releasing the proxy, you can use the `removeComlink` method provided by the package, it accepts the proxy returned by `setupComlink`.

you can access nested objects using dot notion (it uses `lodash/get` to resolve). checkout example1 in the source to see the usage.

**new**: as of v2.1.0 you can ALSO use nested functions and props normally (uses proxy under the hood). check out the second test of `setup.test.js` file if you want to know what I'm talking about. (intellisense is more enjoyable now)

also as a bonus you can typehint your proxies using jsdocs to set your proxy types to corresponding classes for intellisense support. just note that all methods are async through the proxy. this is also available in example2 in the source.

## usage

```bash
npm i ipc-utils
# or
yarn add ipc-utils
```

then

```js
// child.js
const { setupComlink } = require('ipc-utils');
class SomeClass {
  constructor() {
    this.parent = setupComlink.call(this);
  }

  childMethod() {
    console.log('tada');
  }
}
new SomeClass();

// parent.js
const { fork } = require('child_process');
const { setupComlink, removeComlink } = require('ipc-utils');

const forkedProcess = fork(
  path.join(__dirname, 'child.js'), [], { stdio: 'inherit', execArgv: [] },
);

const proxy = setupComlink.call(this, forkedProcess);

async function runChildMethod(){
  await proxy.childMethod();
  removeComlink(proxy);
}
runChildMethod();
// console logs 'tada' since the stdio is inherited in this example


```

Check out [example](https://github.com/jd1378/ipc-utils/blob/master/examples/example1/)

you can clone repo and run example1 and example2 to check it working:

```bash
npm run example1
npm run example2
# or
yarn example1
yarn example2
```

and run tests:

```bash
npm run test
# or
yarn test
```
