import { Duplex } from 'stream';

export class DuplexWithDestroy extends Duplex {
  // eslint-disable-next-line no-shadow
  _destroy(error: Error | null, cb: (error: Error | null) => void): void {
    this.push(null);
    this.end();
    cb(error);
  }
}
