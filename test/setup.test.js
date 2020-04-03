const { promisify } = require('util');
const path = require('path');
const { fork } = require('child_process');
const { setupComlink, removeComlink } = require('../src/index');

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('setupComlink', () => {
  let childProcess;
  let testClass;

  const mock = jest.fn();

  class TestClass {
    constructor(childProc) {
      this.mockFunc = mock;
      this.proxy = setupComlink.call(this, childProc);
    }

    removeProxy() {
      return removeComlink(this.proxy);
    }

    test() {
      return 'CanDo2';
    }
  }

  beforeEach(() => {
    childProcess = fork(
      path.join(__dirname, 'childFork.js'), [], { stdio: 'inherit', execArgv: [] },
    );
    testClass = new TestClass(childProcess);
  });


  afterEach(async () => {
    await testClass.removeProxy();
    await timeout(10);
    if (childProcess.exitCode === null) {
      childProcess.kill(9);
    }
  });

  it("can execute child's method", async () => {
    const result = await testClass.proxy.test();
    expect(result).toBe('canDo');
  });

  it("child can execute parent's method", async () => {
    await testClass.proxy['parent.mockFunc']();
    expect(mock).toBeCalledTimes(1);
    const result = await testClass.proxy['parent.test']();
    expect(result).toBe('CanDo2');
    // sugar dot notion
    const resul2 = await testClass.proxy.parent.test();
    expect(resul2).toBe('CanDo2');
  });
});
