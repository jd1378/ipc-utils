const path = require('path');
const { fork } = require('child_process');
const { setupComlink, removeComlink } = require('../src/index');

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('setupComlink', () => {
  let childProcess;
  /**
   * @type {Parent}
   */
  let parent;

  const mock = jest.fn();

  class Parent {
    constructor(childProc) {
      this.mockFunc = mock;
      /**
       * @type {import('./Child')}
       */
      this.proxy = setupComlink.call(this, childProc);
    }

    removeProxy() {
      return removeComlink(this.proxy);
    }
  }

  beforeEach(() => {
    childProcess = fork(path.join(__dirname, 'ChildFork.js'), [], {
      stdio: 'inherit',
      execArgv: [],
    });
    parent = new Parent(childProcess);
  });

  afterEach(async () => {
    await parent.removeProxy();
    await timeout(10);
    if (childProcess.exitCode === null) {
      childProcess.kill(9);
    }
  });

  it('can wait for 100k commands', async () => {
    const pending = [];
    for (let i = 0; i < 100000; i++) {
      pending.push(parent.proxy.longTask());
    }
    const results = await Promise.all(pending);
    results.forEach((res) => expect(res).toBe('yes'));
  });
});
