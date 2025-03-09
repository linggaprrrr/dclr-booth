declare module 'mjpeg-consumer' {
  import { Transform } from 'stream';
  
  class MjpegConsumer extends Transform {
    constructor(options?: any);
    destroy(): void;
  }
  
  export = MjpegConsumer;
} 