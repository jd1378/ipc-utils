const Parent = require('./Parent');

const parent = new Parent();

async function useChildMethod() {
  // eslint-disable-next-line no-console
  console.log('child result: ', await parent.child.childMethod());
  await parent.removeComlink();
}

useChildMethod();
