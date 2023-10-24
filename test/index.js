const {
  PassThrough,
  Transform,
  finished,
  pipeline,
} = require('readable-stream');
const test = require('tape');
// eslint-disable-next-line import/no-unresolved
const ObjMultiplex = require('../dist');

test('basic - string', (t) => {
  t.plan(2);

  const { inTransport, inStream, outStream } = basicTestSetup();
  bufferToEnd(outStream, (err, results) => {
    t.error(err, 'should not error');
    t.deepEqual(results, ['haay', 'wuurl'], 'results should match');
    t.end();
  });

  // pass in messages
  inStream.write('haay');
  inStream.write('wuurl');

  // simulate disconnect
  setImmediate(() => inTransport.end(null, () => undefined));
});

test('basic - obj', (t) => {
  t.plan(2);

  const { inTransport, inStream, outStream } = basicTestSetup();
  bufferToEnd(outStream, (err, results) => {
    t.error(err, 'should not error');
    t.deepEqual(
      results,
      [{ message: 'haay' }, { message: 'wuurl' }],
      'results should match',
    );
    t.end();
  });
  // pass in messages
  inStream.write({ message: 'haay' });
  inStream.write({ message: 'wuurl' });

  // simulate disconnect
  setImmediate(() => inTransport.end(null, () => undefined));
});

test('roundtrip', (t) => {
  t.plan(2);

  const { outTransport, inStream, outStream } = basicTestSetup();
  const doubler = new Transform({
    objectMode: true,
    transform(chunk, _end, callback) {
      const result = chunk * 2;
      callback(null, result);
    },
  });

  pipeline(outStream, doubler, outStream, () => undefined);

  bufferToEnd(inStream, (err, results) => {
    t.error(err, 'should not error');
    t.deepEqual(results, [20, 24], 'results should match');
    t.end();
  });
  // pass in messages
  inStream.write(10);
  inStream.write(12);

  // simulate disconnect
  setTimeout(() => outTransport.end(), 100);
});

test('error on createStream if destroyed', (t) => {
  const stream = new ObjMultiplex();
  stream.destroy();
  try {
    stream.createStream('controller');
  } catch (e) {
    t.assert(e.message.includes('already destroyed'), true);
    t.end();
  }
});

test('error on createStream if ended', (t) => {
  const stream = new ObjMultiplex();
  stream.end();
  try {
    stream.createStream('controller');
  } catch (e) {
    t.assert(e.message.includes('already ended'), true);
    t.end();
  }
});

// util

function basicTestSetup() {
  // setup multiplex and Transport
  const inMux = new ObjMultiplex();
  const outMux = new ObjMultiplex();
  const inTransport = new PassThrough({ objectMode: true });
  const outTransport = new PassThrough({ objectMode: true });

  // setup substreams
  const inStream = inMux.createStream('hello');
  const outStream = outMux.createStream('hello');

  pipeline(inMux, inTransport, outMux, outTransport, inMux, () => undefined);

  return {
    inTransport,
    outTransport,
    inMux,
    outMux,
    inStream,
    outStream,
  };
}

function bufferToEnd(stream, callback) {
  const results = [];
  let flushed = false;
  function onFinish(err) {
    if (flushed) {
      return;
    }
    flushed = true;
    callback(err, results);
  }
  stream.prependListener('close', onFinish);
  finished(stream, onFinish);
  stream.on('data', (chunk) => {
    results.push(chunk);
  });
}
