import chai from 'chai';
import chaiAsPromised from "chai-as-promised";

import 'regenerator-runtime/runtime';

import SevenBoom from './sevenBoom';

var chaiDateString = require('chai-date-string');
chai.use(chaiAsPromised);
chai.use(chaiDateString);
const expect = chai.expect;

// Most of this tests are taken from the Boom repo
// In order to make sure that you can just replace all Boom with SevenBoom
describe('Seven Boom features', () => {
  it('does not use default guid generator and timeThrown if they are not set in option', (done) => {
    SevenBoom.init();
    const error = SevenBoom.badRequest();
    expect(error.output.payload.guid).to.not.exist
    expect(error.output.payload.timeThrown).to.not.exist
    done();
  });

  it('uses the default guid generator and timeThrown', (done) => {
    const opts = [{
        name : 'timeThrown',
        order: 1,
        default: null
      }, {
        name : 'guid',
        order: 2,
        default: null
      }
    ];

    SevenBoom.init(opts);
    const error = SevenBoom.badRequest();
    expect(error.output.payload.guid).to.be.a('string');
    expect(error.output.payload.timeThrown).to.be.a.dateString();
    done();
  });

  it('uses the default guid generator and timeThrown with errorCode arg', (done) => {
    const opts = [
      {
        name : 'errorCode',
        order: 1
      }, {
        name : 'timeThrown',
        order: 2,
        default: null
      }, {
        name : 'guid',
        order: 3,
        default: null
      }
    ];

    SevenBoom.init(opts);
    const error = SevenBoom.badRequest('my message', {'key': 'val'}, 'myErrCode');
    expect(error.output.payload.guid).to.be.a('string');
    expect(error.output.payload.timeThrown).to.be.a.dateString();
    expect(error.message).to.equal('my message');
    expect(error.output.statusCode).to.equal(400);
    expect(error.output.payload).to.include({
          statusCode: 400,
          error: 'Bad Request',
          message: 'my message',
          errorCode: 'myErrCode'
        });
    expect(error.data).to.include({'key': 'val'});
    done();
  });

  it('uses a constant default value for an arg', (done) => {
    const opts = [
      {
        name : 'argWithDefault',
        order: 1,
        default: 'defaultVal'
      }
    ];

    SevenBoom.init(opts);
    const error = SevenBoom.badRequest('my message', {'key': 'val'});
    expect(error.output.payload).to.include({
          statusCode: 400,
          error: 'Bad Request',
          message: 'my message',
          argWithDefault: 'defaultVal'
        });
    expect(error.data).to.include({'key': 'val'});
    done();
  });

  it('uses a constant default value for an arg in the middle of the args passed', (done) => {
    const opts = [
      {
        name : 'argWithDefault',
        order: 1,
        default: 'defaultVal'
      },
      {
        name : 'argWithDefault2',
        order: 2,
        default: 'defaultVal2'
      }
    ];

    SevenBoom.init(opts);
    const error = SevenBoom.badRequest('my message', {'key': 'val'}, undefined, 'val3');
    expect(error.output.payload).to.include({
          statusCode: 400,
          error: 'Bad Request',
          message: 'my message',
          argWithDefault: 'defaultVal',
          argWithDefault2: 'val3'
        });
    expect(error.data).to.include({'key': 'val'});
    done();
  });

  it('uses a function default value for an arg', (done) => {
    const opts = [
      {
        name : 'argWithDefaultFunc',
        order: 1,
        default: () => {return 123}
      }
    ];

    SevenBoom.init(opts);
    const error = SevenBoom.badRequest('my message', {'key': 'val'});
    expect(error.output.payload).to.include({
          statusCode: 400,
          error: 'Bad Request',
          message: 'my message',
          argWithDefaultFunc: 123
        });
    expect(error.data).to.include({'key': 'val'});
    done();
  });

  it('let me override a constant default value for an arg', (done) => {
    const opts = [
      {
        name : 'argWithDefault',
        order: 1,
        default: 'defaultVal'
      }
    ];

    SevenBoom.init(opts);
    const error = SevenBoom.badRequest('my message', {'key': 'val'}, 'overrideVal');
    expect(error.output.payload).to.include({
          statusCode: 400,
          error: 'Bad Request',
          message: 'my message',
          argWithDefault: 'overrideVal'
        });
    expect(error.data).to.include({'key': 'val'});
    done();
  });

  it('let me override a function default value for an arg', (done) => {
    const opts = [
      {
        name : 'argWithDefaultFunc',
        order: 1,
        default: () => {return 123}
      }
    ];

    SevenBoom.init(opts);
    const error = SevenBoom.badRequest('my message', {'key': 'val'}, 'overrideVal');
    expect(error.output.payload).to.include({
          statusCode: 400,
          error: 'Bad Request',
          message: 'my message',
          argWithDefaultFunc: 'overrideVal'
        });
    expect(error.data).to.include({'key': 'val'});
    done();
  });

  it('let me override the default guid and timeThrown functions', (done) => {
    const opts = [
      {
        name : 'timeThrown',
        order: 2,
        default: '123'
      }, {
        name : 'guid',
        order: 3,
        default: () => {return '456'}
      }
    ];

    SevenBoom.init(opts);
    const error = SevenBoom.badRequest('my message', {'key': 'val'});
    expect(error.output.payload).to.include({
          statusCode: 400,
          error: 'Bad Request',
          message: 'my message',
          timeThrown: '123',
          guid: '456'
        });
    expect(error.data).to.include({'key': 'val'});
    done();
  });
});
