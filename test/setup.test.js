const { promisify } = require('util');
const Parent = require('../examples/Parent');

const nextTick = promisify(process.nextTick);
const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('setupComlink', () => {
  /** @type Parent */
  let parent;
  beforeEach(() => {
    parent = new Parent();
  });
  afterEach(async () => {
    await parent.removeComlink();
    // @ts-ignore
    if (parent.childProcess.exitCode === null) {
      parent.childProcess.kill(9);
    }
  });

  it("can execute child's method", async () => {
    const result = await parent.child.childMethod();
    expect(result).toBe("I'm from child");
  });

  it("child can execute parent's method", async () => {
    const result = await parent.child['parent.parentMethod']();
    expect(result).toBe("I'm from parent");
  });
});
