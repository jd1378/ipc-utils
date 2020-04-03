/**
 * @typedef {import("process")} Process
 */
const uuidv4 = require('uuid').v4;
const get = require('lodash/get');

const symbols = {
  removeListeners: Symbol('removeListeners'),
  removeChild: Symbol('removeChildListener'),
};

/**
 *
 * @param {String} method
 */
function requestExecute(proc, method, ...args) {
  if (!proc) {
    return Promise.reject(new Error('Process undefined'));
  }
  return new Promise((resolve, reject) => {
    if (method === symbols.removeChild) {
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
    proc.send({ method, uuid, args }, (error) => { if (error) { reject(error); } });
  });
}

/**
 *
 * @param {Process} proc
 */
function setupProxy(proc) {
  return new Proxy(
    {},
    {
      get(target, propKey) {
        if (propKey === symbols.removeListeners) {
          return target[propKey];
        }
        return (...args) => requestExecute.apply(this, [proc, propKey, ...args]);
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
 * @param {Object} m
 * @param {String} m.method - method to call
 * @param {Array} m.args - method arguments
 * @param {String} m.uuid - the method uuid;
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


/**
 * @param {Process} proc - defaults to current process
 */
function setupComlink(proc = process) {
  const proxy = setupProxy.call(this, proc);
  const handler = attachHandler.call(this, proc);
  /**
   * @param {{handler: function, proxy: Object}} options
   * @param {Process} proc - defaults to current process
   */
  const removeComlinkCommand = async () => {
    if (proc.exitCode === null) {
      await proxy[symbols.removeChild]();
      proc.off('message', handler);
    }
  };

  proxy[symbols.removeListeners] = removeComlinkCommand;

  return proxy;
}

function removeComlink(proxy) {
  return proxy[symbols.removeListeners]();
}


module.exports = {
  setupComlink,
  removeComlink,
};
