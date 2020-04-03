const { fork } = require('child_process');

const path = require('path');
const { setupComlink, removeComlink } = require('../../src/index');


class Parent {
  constructor() {
    this.setupChild();
  }

  setupChild() {
    this.childProcess = fork(
      path.join(__dirname, 'example2fork.js'),
      [],
      {
        stdio: 'inherit',
        execArgv: [],
      },
    );

    /**
     * you can use jsdocs to get intellisense support on vscode for your proxy (kinda) ! :D
     * @type {import('./Child')}
     */
    this.child = setupComlink.call(this, this.childProcess);
    this.removeComlink = () => removeComlink(this.child);
  }

  parentMethod() {
    return "I'm from parent";
  }
}

module.exports = Parent;
