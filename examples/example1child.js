const Child = require('./Child');

const child = new Child();

async function useParent() {
  // eslint-disable-next-line no-console
  console.log('parent result: ', await child.parent.parentMethod());
}
useParent();
