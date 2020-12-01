import { Duplex } from 'readable-stream';
import eos from 'end-of-stream';
import once from 'once';
import { Substream } from './Substream';

const IGNORE_SUBSTREAM: Record<string, unknown> = {};

export class ObjectMultiplex extends Duplex {

  private _substreams: Record<string, Substream | Record<string, any>>;

  constructor(_opts: Record<string, unknown> = {}) {
    const opts = Object.assign({}, _opts, {
      objectMode: true,
    });
    super(opts);
    this._substreams = {};
  }

  createStream(name: string): Substream {
    // validate name
    if (!name) {
      throw new Error('ObjectMultiplex - name must not be empty');
    }

    if (this._substreams[name]) {
      throw new Error(`ObjectMultiplex - Substream for name "${name}" already exists`);
    }

    // create substream
    const substream = new Substream({ parent: this, name });
    this._substreams[name] = substream;

    // listen for parent stream to end
    anyStreamEnd(this, (_error?: Error | null) => {
      substream.destroy();
    });

    return substream;
  }

  // ignore streams (dont display orphaned data warning)
  ignoreStream(name: string): void {
    // validate name
    if (!name) {
      throw new Error('ObjectMultiplex - name must not be empty');
    }
    if (this._substreams[name]) {
      throw new Error(`ObjectMultiplex - Substream for name "${name}" already exists`);
    }
    // set
    this._substreams[name] = IGNORE_SUBSTREAM;
  }

  _read(): void {
    return undefined;
  }

  _write(
    chunk: Record<string, any>,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {

    const { name, data } = chunk;

    if (!name) {
      console.warn(`ObjectMultiplex - malformed chunk without name "${chunk}"`);
      return callback();
    }

    // get corresponding substream
    const substream = this._substreams[name];
    if (!substream) {
      console.warn(`ObjectMultiplex - orphaned data for stream "${name}"`);
      return callback();
    }

    // push data into substream
    if (substream !== IGNORE_SUBSTREAM) {
      substream.push(data);
    }

    return callback();
  }
}

// util
function anyStreamEnd(stream: ObjectMultiplex, _cb: (error?: Error | null) => void) {
  const cb = once(_cb);
  eos(stream, { readable: false }, cb);
  eos(stream, { writable: false }, cb);
}
