const { setupComlink } = require('../../src/index');

class ChildProcess {
  constructor() {
    this.parent = setupComlink.call(this);
  }

  someMethod() {
    return 'some child result';
  }

  async useParent() {
    await this.parent.printHi();
  }
}

const connector = new ChildProcess();
