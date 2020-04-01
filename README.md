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
// Child
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

// Parent
const { setupComlink } = require('ipc-utils');
const forkedProcess = forkChildSomeHow();
const { proxy, removeComlink } = setupComlink(forkedProcess)

async function runChildMethod(){
  await proxy.childMethod();
}
runChildMethod();
// logs 'tada' in child


```

Check out [example](https://github.com/jd1378/ipc-utils/blob/master/examples/example1.js)
  