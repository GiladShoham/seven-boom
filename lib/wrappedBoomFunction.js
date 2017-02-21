import _ from 'lodash';

const defaultArgs = {
  default: ['message', 'data'],
  methodNotAllowed: ['message', 'data', 'allow'],
  unauthorized: ['message', 'scheme', 'attributes'],
  create: ['statusCode', 'message', 'data'],
  wrap: ['error', 'statusCode', 'message']
}

/**
 * This function gets a boom function and arguments in new format and return
 * a wrapped boom function
 */
function getWrappedFunc(funcName, func, ...args) {
  const funcDefaultArgs = defaultArgs[funcName] || defaultArgs['default'];
  const allArgs = funcDefaultArgs.concat(args);

  return function(...allArgs) {
    const boomArgs = _.take(allArgs, funcDefaultArgs.length);
    let result =  func.call(null, ...boomArgs);
    for (var i = 0; i < args.length; i++) {
      let currArgVal = allArgs[i + funcDefaultArgs.length];
      const argDef = args[i];
      // Check if we need to use the defaults
      if (currArgVal === undefined){
        // Run the function from the args def
        if (_.isFunction(argDef.default)) {
          result.output.payload[argDef.name] = argDef.default();
        // Add the default value to result
        } else if (argDef.default) {
          result.output.payload[argDef.name] = argDef.default;
        }
        // Add the passed value to result
      } else {
        result.output.payload[argDef.name] = currArgVal;
      }
    }
    return result;
  };
}

export {
  getWrappedFunc
}
