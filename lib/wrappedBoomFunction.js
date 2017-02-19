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
function getWrappedFunc(funcName, func, guidFunc, timeThrownFunc) {
  const funcDefaultArgs = defaultArgs[funcName] || defaultArgs['default'];
  funcDefaultArgs.push('pbuliceData');
  return function(...funcDefaultArgs) {
    // let mergedData = data || {};
    // mergedData.public = publicData;
    let result =  func.call(null, ...funcDefaultArgs);
    result.output.payload.timeThrown = timeThrownFunc();
    result.output.payload.guid = guidFunc();
    // result.output.payload.errorCode = errorCode;
    return result;
  };
}

export {
  getWrappedFunc
}
