const { setupComlink } = require('../../src/index');

class Child {
  constructor() {
    /**
     * you can use jsdocs to get intellisense support on vscode for your proxy (kinda) ! :D
     * @type {import('./Parent')}
     */
    this.parent = setupComlink.call(this);
  }

  childMethod() {
    return "I'm from child";
  }
}

module.exports = Child;
