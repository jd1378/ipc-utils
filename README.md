# ipc-utils

makes using child_process using fork easy

## Warning

this is experimental. use at your own risk.

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
class SomeClass() {
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
