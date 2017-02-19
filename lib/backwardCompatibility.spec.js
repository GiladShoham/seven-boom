import chai from 'chai';
import chaiAsPromised from "chai-as-promised";

import 'regenerator-runtime/runtime';

import SevenBoom from './sevenBoom';
SevenBoom.init();

chai.use(chaiAsPromised);
const expect = chai.expect;

// Most of this tests are taken from the Boom repo
// In order to make sure that you can just replace all Boom with SevenBoom
describe('Boom backward compatibility', () => {
  it('returns the same object when already boom', (done) => {

    const error = SevenBoom.badRequest();
    const wrapped = SevenBoom.wrap(error);
    expect(error).to.equal(wrapped);
    done();
  });

  it('should contain boom fields', (done) => {
    const error = SevenBoom.badRequest('Missing data', { type: 'user' });
    expect(error.data.type).to.equal('user');
    expect(error.output.payload.message).to.equal('Missing data');
    done();
  });

  it('returns an error with info when constructed using another error', (done) => {

    const error = new Error('ka-boom');
    error.xyz = 123;
    const err = SevenBoom.wrap(error);
    expect(err.xyz).to.equal(123);
    expect(err.message).to.equal('ka-boom');
    expect(err.output.statusCode).to.equal(500);
    expect(err.output.payload).to.include({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'An internal server error occurred',
        });
    expect(err.data).to.equal(null);
    done();
  });

  it('does not override data when constructed using another error', (done) => {

      const error = new Error('ka-boom');
      error.data = { useful: 'data' };
      const err = SevenBoom.wrap(error);
      expect(err.data).to.equal(error.data);
      done();
    });

    it('sets new message when none exists', (done) => {

      const error = new Error();
      const wrapped = SevenBoom.wrap(error, 400, 'something bad');
      expect(wrapped.message).to.equal('something bad');
      done();
  });

  it('throws when statusCode is not a number', (done) => {

      expect(() => {

          SevenBoom.create('x');
      }).to.throw('First argument must be a number (400+): x');
      done();
  });

  it('will cast a number-string to an integer', (done) => {

      const codes = [
          { input: '404', result: 404 },
          { input: '404.1', result: 404 },
          { input: 400, result: 400 },
          { input: 400.123, result: 400 }
      ];

      for (let i = 0; i < codes.length; ++i) {
          const code = codes[i];
          const err = SevenBoom.create(code.input);
          expect(err.output.statusCode).to.equal(code.result);
      }

      done();
  });

  it('throws when statusCode is not finite', (done) => {

      expect(() => {

          SevenBoom.create(1 / 0);
        }).to.throw('First argument must be a number (400+): null');
      done();
    });

  it('sets error code to unknown', (done) => {

      const err = SevenBoom.create(999);
      expect(err.output.payload.error).to.equal('Unknown');
      done();
    });

  describe('isBoom()', () => {

    it('returns true for Boom object', (done) => {

        expect(SevenBoom.badRequest().isBoom).to.equal(true);
        done();
      });

    it('returns false for Error object', (done) => {

        expect((new Error())).to.not.have.property('isBoom');
        done();
      });
  });

  describe('badRequest()', () => {

    it('returns a 400 error statusCode', (done) => {

        const error = SevenBoom.badRequest();

        expect(error.output.statusCode).to.equal(400);
        expect(error.isServer).to.equal(false);
        done();
    });

    it('sets the message with the passed in message', (done) => {

        expect(SevenBoom.badRequest('my message').message).to.equal('my message');
        done();
    });

    it('sets the message to HTTP status if none provided', (done) => {

        expect(SevenBoom.badRequest().message).to.equal('Bad Request');
        done();
    });
});

  describe('unauthorized()', () => {

      it('returns a 401 error statusCode', (done) => {

          const err = SevenBoom.unauthorized();
          expect(err.output.statusCode).to.equal(401);
          expect(err.output.headers).to.be.empty;
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.unauthorized('my message').message).to.equal('my message');
          done();
      });

      it('returns a WWW-Authenticate header when passed a scheme', (done) => {

          const err = SevenBoom.unauthorized('boom', 'Test');
          expect(err.output.statusCode).to.equal(401);
          expect(err.output.headers['WWW-Authenticate']).to.equal('Test error="boom"');
          done();
      });

      it('returns a WWW-Authenticate header set to the schema array value', (done) => {

          const err = SevenBoom.unauthorized(null, ['Test', 'one', 'two']);
          expect(err.output.statusCode).to.equal(401);
          expect(err.output.headers['WWW-Authenticate']).to.equal('Test, one, two');
          done();
      });

      it('returns a WWW-Authenticate header when passed a scheme and attributes', (done) => {

          const err = SevenBoom.unauthorized('boom', 'Test', { a: 1, b: 'something', c: null, d: 0 });
          expect(err.output.statusCode).to.equal(401);
          expect(err.output.headers['WWW-Authenticate']).to.equal('Test a="1", b="something", c="", d="0", error="boom"');
          expect(err.output.payload.attributes).to.deep.equal({ a: 1, b: 'something', c: '', d: 0, error: 'boom' });
          done();
      });

      it('returns a WWW-Authenticate header when passed attributes, missing error', (done) => {

          const err = SevenBoom.unauthorized(null, 'Test', { a: 1, b: 'something', c: null, d: 0 });
          expect(err.output.statusCode).to.equal(401);
          expect(err.output.headers['WWW-Authenticate']).to.equal('Test a="1", b="something", c="", d="0"');
          expect(err.isMissing).to.equal(true);
          done();
      });

      it('sets the isMissing flag when error message is empty', (done) => {

          const err = SevenBoom.unauthorized('', 'Basic');
          expect(err.isMissing).to.equal(true);
          done();
      });

      it('does not set the isMissing flag when error message is not empty', (done) => {

          const err = SevenBoom.unauthorized('message', 'Basic');
          expect(err.isMissing).to.equal(undefined);
          done();
      });

      it('sets a WWW-Authenticate when passed as an array', (done) => {

          const err = SevenBoom.unauthorized('message', ['Basic', 'Example e="1"', 'Another x="3", y="4"']);
          expect(err.output.headers['WWW-Authenticate']).to.equal('Basic, Example e="1", Another x="3", y="4"');
          done();
      });
  });


  describe('paymentRequired()', () => {

      it('returns a 402 error statusCode', (done) => {

          expect(SevenBoom.paymentRequired().output.statusCode).to.equal(402);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.paymentRequired('my message').message).to.equal('my message');
          done();
      });

      it('sets the message to HTTP status if none provided', (done) => {

          expect(SevenBoom.paymentRequired().message).to.equal('Payment Required');
          done();
      });
  });


  describe('methodNotAllowed()', () => {

      it('returns a 405 error statusCode', (done) => {

          expect(SevenBoom.methodNotAllowed().output.statusCode).to.equal(405);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.methodNotAllowed('my message').message).to.equal('my message');
          done();
      });

      it('returns an Allow header when passed a string', (done) => {

          const err = SevenBoom.methodNotAllowed('my message', null, 'GET');
          expect(err.output.statusCode).to.equal(405);
          expect(err.output.headers.Allow).to.equal('GET');
          done();
      });

      it('returns an Allow header when passed an array', (done) => {

          const err = SevenBoom.methodNotAllowed('my message', null, ['GET', 'POST']);
          expect(err.output.statusCode).to.equal(405);
          expect(err.output.headers.Allow).to.equal('GET, POST');
          done();
      });
  });


  describe('notAcceptable()', () => {

      it('returns a 406 error statusCode', (done) => {

          expect(SevenBoom.notAcceptable().output.statusCode).to.equal(406);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.notAcceptable('my message').message).to.equal('my message');
          done();
      });
  });


  describe('proxyAuthRequired()', () => {

      it('returns a 407 error statusCode', (done) => {

          expect(SevenBoom.proxyAuthRequired().output.statusCode).to.equal(407);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.proxyAuthRequired('my message').message).to.equal('my message');
          done();
      });
  });


  describe('clientTimeout()', () => {

      it('returns a 408 error statusCode', (done) => {

          expect(SevenBoom.clientTimeout().output.statusCode).to.equal(408);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.clientTimeout('my message').message).to.equal('my message');
          done();
      });
  });


  describe('conflict()', () => {

      it('returns a 409 error statusCode', (done) => {

          expect(SevenBoom.conflict().output.statusCode).to.equal(409);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.conflict('my message').message).to.equal('my message');
          done();
      });
  });


  describe('resourceGone()', () => {

      it('returns a 410 error statusCode', (done) => {

          expect(SevenBoom.resourceGone().output.statusCode).to.equal(410);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.resourceGone('my message').message).to.equal('my message');
          done();
      });
  });


  describe('lengthRequired()', () => {

      it('returns a 411 error statusCode', (done) => {

          expect(SevenBoom.lengthRequired().output.statusCode).to.equal(411);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.lengthRequired('my message').message).to.equal('my message');
          done();
      });
  });


  describe('preconditionFailed()', () => {

      it('returns a 412 error statusCode', (done) => {

          expect(SevenBoom.preconditionFailed().output.statusCode).to.equal(412);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.preconditionFailed('my message').message).to.equal('my message');
          done();
      });
  });


  describe('entityTooLarge()', () => {

      it('returns a 413 error statusCode', (done) => {

          expect(SevenBoom.entityTooLarge().output.statusCode).to.equal(413);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.entityTooLarge('my message').message).to.equal('my message');
          done();
      });
  });


  describe('uriTooLong()', () => {

      it('returns a 414 error statusCode', (done) => {

          expect(SevenBoom.uriTooLong().output.statusCode).to.equal(414);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.uriTooLong('my message').message).to.equal('my message');
          done();
      });
  });


  describe('unsupportedMediaType()', () => {

      it('returns a 415 error statusCode', (done) => {

          expect(SevenBoom.unsupportedMediaType().output.statusCode).to.equal(415);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.unsupportedMediaType('my message').message).to.equal('my message');
          done();
      });
  });


  describe('rangeNotSatisfiable()', () => {

      it('returns a 416 error statusCode', (done) => {

          expect(SevenBoom.rangeNotSatisfiable().output.statusCode).to.equal(416);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.rangeNotSatisfiable('my message').message).to.equal('my message');
          done();
      });
  });


  describe('expectationFailed()', () => {

      it('returns a 417 error statusCode', (done) => {

          expect(SevenBoom.expectationFailed().output.statusCode).to.equal(417);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.expectationFailed('my message').message).to.equal('my message');
          done();
      });
  });


  describe('badData()', () => {

      it('returns a 422 error statusCode', (done) => {

          expect(SevenBoom.badData().output.statusCode).to.equal(422);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.badData('my message').message).to.equal('my message');
          done();
      });
  });


  describe('locked()', () => {

      it('returns a 423 error statusCode', (done) => {

          expect(SevenBoom.locked().output.statusCode).to.equal(423);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.locked('my message').message).to.equal('my message');
          done();
      });
  });


  describe('preconditionRequired()', () => {

      it('returns a 428 error statusCode', (done) => {

          expect(SevenBoom.preconditionRequired().output.statusCode).to.equal(428);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.preconditionRequired('my message').message).to.equal('my message');
          done();
      });
  });


  describe('tooManyRequests()', () => {

      it('returns a 429 error statusCode', (done) => {

          expect(SevenBoom.tooManyRequests().output.statusCode).to.equal(429);
          done();
      });

      it('sets the message with the passed-in message', (done) => {

          expect(SevenBoom.tooManyRequests('my message').message).to.equal('my message');
          done();
      });
  });


  describe('illegal()', () => {

      it('returns a 451 error statusCode', (done) => {

          expect(SevenBoom.illegal().output.statusCode).to.equal(451);
          done();
      });

      it('sets the message with the passed-in message', (done) => {

          expect(SevenBoom.illegal('my message').message).to.equal('my message');
          done();
      });
  });

  describe('serverUnavailable()', () => {

      it('returns a 503 error statusCode', (done) => {

          expect(SevenBoom.serverUnavailable().output.statusCode).to.equal(503);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.serverUnavailable('my message').message).to.equal('my message');
          done();
      });
  });

  describe('forbidden()', () => {

      it('returns a 403 error statusCode', (done) => {

          expect(SevenBoom.forbidden().output.statusCode).to.equal(403);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.forbidden('my message').message).to.equal('my message');
          done();
      });
  });

  describe('notFound()', () => {

      it('returns a 404 error statusCode', (done) => {

          expect(SevenBoom.notFound().output.statusCode).to.equal(404);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.notFound('my message').message).to.equal('my message');
          done();
      });
  });

  describe('internal()', () => {

      it('returns a 500 error statusCode', (done) => {

          expect(SevenBoom.internal().output.statusCode).to.equal(500);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          const err = SevenBoom.internal('my message');
          expect(err.message).to.equal('my message');
          expect(err.isServer).to.equal(true);
          expect(err.output.payload.message).to.equal('An internal server error occurred');
          done();
      });

      it('passes data on the callback if its passed in', (done) => {

          expect(SevenBoom.internal('my message', { my: 'data' }).data.my).to.equal('data');
          done();
      });

      it('returns an error with composite message', (done) => {

          try {
              x.foo();
          }
          catch (err) {
              const boom = SevenBoom.internal('Someting bad', err);
              expect(boom.message).to.equal('Someting bad: x is not defined');
              expect(boom.isServer).to.equal(true);
              done();
          }
      });
  });

  describe('notImplemented()', () => {

      it('returns a 501 error statusCode', (done) => {

          expect(SevenBoom.notImplemented().output.statusCode).to.equal(501);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.notImplemented('my message').message).to.equal('my message');
          done();
      });
  });


  describe('badGateway()', () => {

      it('returns a 502 error statusCode', (done) => {

          expect(SevenBoom.badGateway().output.statusCode).to.equal(502);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.badGateway('my message').message).to.equal('my message');
          done();
      });
  });

  describe('gatewayTimeout()', () => {

      it('returns a 504 error statusCode', (done) => {

          expect(SevenBoom.gatewayTimeout().output.statusCode).to.equal(504);
          done();
      });

      it('sets the message with the passed in message', (done) => {

          expect(SevenBoom.gatewayTimeout('my message').message).to.equal('my message');
          done();
      });
  });

  describe('badImplementation()', () => {

      it('returns a 500 error statusCode', (done) => {

          const err = SevenBoom.badImplementation();
          expect(err.output.statusCode).to.equal(500);
          expect(err.isDeveloperError).to.equal(true);
          expect(err.isServer).to.equal(true);
          done();
      });
  });
});
