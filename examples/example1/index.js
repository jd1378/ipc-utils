// super simple example
const { fork } = require('child_process');

const path = require('path');
const { setupComlink, removeComlink } = require('../../src/index');

class CurrentProcess {
  constructor() {
    const childProc = fork(
      path.join(__dirname, 'example1fork.js'), [], { stdio: 'inherit', execArgv: [] },
    );
    this.child = setupComlink.call(this, childProc);
    this.removeComlink = () => removeComlink(this.child);
  }

  getSth() {
    return 'Sth';
  }

  printHi() {
    console.log('Hi');
  }
}

(async () => {
  const cp = new CurrentProcess();
  console.log('result from child method: ', await cp.child.someMethod());
  // child can use parent too
  await cp.child.useParent();
  // dot notion is supported (using lodash)
  console.log('even you can call yourself through child: ', await cp.child['parent.getSth']());
  await cp.removeComlink();
})();
