const { setupComlink } = require('../src/index');

class Child {
  constructor() {
    this.parent = setupComlink.call(this);
  }

  test() {
    return 'canDo';
  }

  longTask(wait = 3000) {
    return new Promise((resolve) => {
      setTimeout(() => resolve('yes'), wait);
    });
  }
}

module.exports = Child;
