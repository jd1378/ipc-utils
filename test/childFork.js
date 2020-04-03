const { setupComlink } = require('../src/index');

class ChildClass {
  constructor() {
    this.parent = setupComlink.call(this);
  }

  test() {
    return 'canDo';
  }
}

const child = new ChildClass();
