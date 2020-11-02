/**
 * @typedef {import("process")} Process
 */
const { v4: uuidv4 } = require('uuid');
const get = require('lodash/get');

const IPC_UTILS_COMLINK_REMOVE_PROXY_CHILD_SIDE = 'IPC_UTILS_COMLINK_REMOVE_PROXY_CHILD_SIDE';
const IPC_UTILS_COMLINK_REMOVE_LISTENERS = 'IPC_UTILS_COMLINK_REMOVE_LISTENERS';

/**
 * @param {Process} proc
 * @param {String} method
 */
function requestExecute(proc, method, ...args) {
  if (!proc) {
    return Promise.reject(new Error('Process undefined'));
  }
  return new Promise((resolve, reject) => {
    if (method === IPC_UTILS_COMLINK_REMOVE_PROXY_CHILD_SIDE) {
      proc.send({ release: true }, () => resolve());
      return;
    }

    const uuid = uuidv4();
    const eventHandler = (m) => {
      if (m.uuid === uuid) {
        proc.off('message', eventHandler);
        if (m.error) {
          reject(m.error);
        } else {
          resolve(m.result);
        }
      }
    };
    proc.on('message', eventHandler);
    proc.send({ method, uuid, args }, (error) => {
      if (error) {
        reject(error);
        process.off('message', eventHandler);
      }
    });
  });
}

function dotHandler(proc, parentPropKey, target, propKey) {
  if (propKey in target) return target[propKey];
  const newPath = `${parentPropKey}.${propKey}`;
  const requestFunc = (...args) => requestExecute.apply(this, [proc, newPath, ...args]);
  return new Proxy(requestFunc, { get: dotHandler.bind(this, proc, newPath) });
}

/**
 * @param {Process} proc
 *
 * @returns {object}
 */
function setupProxy(proc) {
  return new Proxy(
    {},
    {
      get(target, propKey) {
        if (propKey === IPC_UTILS_COMLINK_REMOVE_LISTENERS) {
          return target[propKey];
        }

        const requestFunc = (...args) => requestExecute.apply(this, [proc, propKey, ...args]);
        return new Proxy(requestFunc, { get: dotHandler.bind(this, proc, propKey) });
      },
    },
  );
}

/**
 * @param {Process} proc - defaults to current process
 */
function attachHandler(proc = process) {
  /**
 * @param {Process} proc
 * @param {Object} message
 * @param {String} message.method - method to call
 * @param {Array} message.args - method arguments
 * @param {String} message.uuid - the method uuid
 * @param {boolean} [message.release] - if the message is a release command
 */
  const messageHandler = async (message) => {
    if (message.release) {
      proc.off('message', messageHandler);
      return;
    }
    const target = get(this, message.method);
    if (typeof target === 'function') {
      try {
        const result = await target.call(this, ...message.args);
        proc.send({ uuid: message.uuid, error: null, result });
      } catch (error) {
        proc.send({ uuid: message.uuid, error, result: null });
      }
    } else if (typeof target !== 'undefined') {
      proc.send({
        uuid: message.uuid,
        error: null,
        result: target,
      });
    }
  };
  proc.on('message', messageHandler);
  return messageHandler;
}

/** @typedef {{
  [k: string]: () => Promise<any>;
} & {
  [IPC_UTILS_COMLINK_REMOVE_LISTENERS]: () => Promise<void>;
  [IPC_UTILS_COMLINK_REMOVE_PROXY_CHILD_SIDE]: () => Promise<void>;
}} ComlinkProxy */

/**
 * Creates a proxy which you can access your child process with.
 * @param {Process} proc - defaults to current process
 *
 * @returns {ComlinkProxy}
 */
function setupComlink(proc = process) {
  const proxy = setupProxy.call(this, proc);
  const handler = attachHandler.call(this, proc);
  const removeComlinkCommand = async () => {
    if (proc.exitCode === null) {
      await proxy[IPC_UTILS_COMLINK_REMOVE_PROXY_CHILD_SIDE]();
      proc.off('message', handler);
    }
  };

  proxy[IPC_UTILS_COMLINK_REMOVE_LISTENERS] = removeComlinkCommand;

  return proxy;
}

/**
 * Removes the comlink message handler on child process
 * @param {ComlinkProxy} proxy
 */
function removeComlink(proxy) {
  return proxy[IPC_UTILS_COMLINK_REMOVE_LISTENERS]();
}

module.exports = {
  setupComlink,
  removeComlink,
};
