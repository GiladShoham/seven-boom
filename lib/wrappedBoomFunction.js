var q = require('q');
import _ from 'lodash';

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

function getWrappedCreate(func, options){}
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
}
