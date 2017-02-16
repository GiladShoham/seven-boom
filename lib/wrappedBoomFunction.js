/**
 * This function gets a boom function and arguments in new format and return
 * a wrapped boom function
 */
function getWrappedFunc(func, guidFunc, timeThrownFunc) {
  return function(message, data, errorCode, publicData) {
    let mergedData = data || {};
    mergedData.public = publicData;
    let result =  func(message, mergedData);
    result.output.payload.timeThrown = timeThrownFunc();
    result.output.payload.guid = guidFunc();
    result.output.payload.errorCode = errorCode;
    return result;
  };
}

function getWrappedMethodNotAllowed(func, guidFunc, timeThrownFunc){
  return function(message, data, allow, errorCode, publicData) {
    let mergedData = data || {};
    mergedData.public = publicData;
    let result =  func(message, mergedData, allow);
    result.output.payload.timeThrown = timeThrownFunc();
    result.output.payload.guid = guidFunc();
    result.output.payload.errorCode = errorCode;
    return result;
  };
}

function getWrappedCreate(func, guidFunc, timeThrownFunc){
  return function(statusCode, message, data) {
    let result =  func(statusCode, message, data);
    result.output.payload.timeThrown = timeThrownFunc();
    result.output.payload.guid = guidFunc();
    return result;
  };
}

function getWrappedWrap(func, guidFunc, timeThrownFunc){
  return function(error, statusCode, message) {
    let result =  func(error, statusCode, message);
    result.output.payload.timeThrown = timeThrownFunc();
    result.output.payload.guid = guidFunc();
    return result;
  };
}

export {
  getWrappedFunc,
  getWrappedCreate,
  getWrappedWrap,
  getWrappedMethodNotAllowed,
}
