import _ from 'lodash';
import { getWrappedFunc } from './wrappedBoomFunction';
var Boom = require('boom');
import uuid from 'uuid';

export default class SevenBoom {
  static init(argsDef) {
    _init(argsDef);
  }
}

function _init(argsDef) {
  const args = _generateArgs(argsDef);
  _.each(_.functions(Boom), (funcName) => {
    SevenBoom[funcName] = getWrappedFunc(funcName, Boom[funcName], ...args);
  });
}

function _generateArgs(argsDef){
  if (!argsDef) return [];
  let sorted = _.sortBy(argsDef, [function(a) { return a.order; }]);
  replaceDefaults(['timeThrown', 'guid'], argsDef);
  return sorted;
}

function replaceDefaults(argsName, argsDef) {
  _.each(argsName, (argName) => {
    let index = _.findIndex(argsDef, { name : argName });
    let arg = argsDef[index];
    arg = _getDefaultActionForArg(arg);
    // Replace item at index using native splice
    argsDef.splice(index, 1, arg);
  })
  return;
}

const defaultArgsActions = {
  timeThrown: _defaultTimeThrown,
  guid: _defaultGenerateGuid
}
function _getDefaultActionForArg(arg) {
  if (arg && !arg.default){
    arg.default = defaultArgsActions[arg.name];
  }
  return arg;
}

function _defaultTimeThrown() {
  return (new Date()).toISOString();
}

function _defaultGenerateGuid() {
  return uuid.v4();
}
