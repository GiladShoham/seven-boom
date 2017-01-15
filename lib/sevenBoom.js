import _ from 'lodash';
import { getWrappedFunc, getWrappedWrap } from './wrappedBoomFunction';
var Boom = require('boom');
import uuid from 'uuid';

export default class SevenBoom {
  static init(options) {
    _init(options);
  }
}

function _init(options) {
  _.each(_.functions(Boom), (funcName) => {
    if (funcName !== 'wrap' && funcName !== 'create') {
      SevenBoom[funcName] = getWrappedFunc(Boom[funcName], _generateGuid, _getTimeThrown);
    }
  });

  SevenBoom.wrap = getWrappedWrap(Boom.wrap, _generateGuid, _getTimeThrown);
}

function _getTimeThrown() {
  return (new Date()).toISOString();
}

function _generateGuid() {
  return uuid.v4();
}
