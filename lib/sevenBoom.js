import _ from 'lodash';
import { getWrappedFunc, getWrappedWrap, getWrappedCreate, getWrappedMethodNotAllowed, getWrappedUnauthorized } from './wrappedBoomFunction';
var Boom = require('boom');
import uuid from 'uuid';

export default class SevenBoom {
  static init(options) {
    _init(options);
  }
}

function _init(options) {
  _.each(_.functions(Boom), (funcName) => {

    if (funcName === 'methodNotAllowed'){
      SevenBoom[funcName] = getWrappedMethodNotAllowed(Boom[funcName], _generateGuid, _getTimeThrown);
    } else if (funcName === 'unauthorized') {
      SevenBoom[funcName] = getWrappedUnauthorized(Boom[funcName], _generateGuid, _getTimeThrown);
    } else if (funcName !== 'wrap' && funcName !== 'create') {
      SevenBoom[funcName] = getWrappedFunc(Boom[funcName], _generateGuid, _getTimeThrown);
    }
  });

  SevenBoom.wrap = getWrappedWrap(Boom.wrap, _generateGuid, _getTimeThrown);
  SevenBoom.create = getWrappedCreate(Boom.create, _generateGuid, _getTimeThrown);
}

function _getTimeThrown() {
  return (new Date()).toISOString();
}

function _generateGuid() {
  return uuid.v4();
}
