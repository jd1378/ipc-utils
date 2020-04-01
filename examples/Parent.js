const { fork } = require('child_process');

const path = require('path');
const { setupComlink } = require('../src/index');


class Parent {
  constructor() {
    this.setupChild();
  }

  setupChild() {
    this.childProcess = fork(
      path.join(__dirname, 'example1child.js'),
      [],
      {
        stdio: 'inherit',
        execArgv: [],
      },
    );

    const { proxy, removeComlink } = setupComlink.call(this, this.childProcess);
    /**
     * you can use jsdocs to get intellisense support on vscode for your proxy (kinda) ! :D
     * @type {import('./Child')}
     */
    this.child = proxy;
    this.removeComlink = removeComlink;
  }

  parentMethod() {
    return "I'm from parent";
  }
}

module.exports = Parent;
