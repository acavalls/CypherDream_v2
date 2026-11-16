/*
// Example 1: https://www.youtube.com/watch?v=_h2ggzwSM5Q

const { Transform } = require('stream');

class ReplaceText extends Transform {

    constructor() {
        super();
        this.data = null;

    }

    _transform(chunk, encoding, callback) {
        this.data = chunk;
        this.push(transformChunk);
        callback();
    }
}

var xstream = new ReplaceText();

readable1
    .pipe(xstream)
    .pipe(writable1);

//////////////////////////////////////////////////////////////////////////

// Example 2: https://github.com/nodejs/help/issues/1076

var fstream = fs.createWriteStream('1.txt');
var mystream = createMyStream();

mystream.pipe(fstream);
mystream.write(Buffer.from('ABC'));
mystream.end();

function createMyStream(){
  return new stream.Transform({
      chunk : 65536,
      transform: transformFunc
  });

  function transformFunc(chunk, encoding, callback){
    var data = chunk.map(a => a ^ 0xFF);

    callback(null, data);
  }
}

// Example 3: https://ar.al/2018/12/20/a-simple-node-transform-stream-with-the-new-node-10-pipeline-function/

const { pipeline, Transform } = require('stream')
const { StringDecoder } = require('string_decoder')

// Handle the raw output from standard input
// (characters, not lines, as is the default).
process.stdin.setRawMode(true)
process.stdin.resume()

class UppercaseCharacters extends Transform {
  constructor(options) {
    super (options)

    // The stream will have Buffer chunks. The
    // decoder converts these to String instances.
    this._decoder = new StringDecoder('utf-8')
  }

  _transform (chunk, encoding, callback) {
    // Convert the Buffer chunks to String.
    if (encoding === 'buffer') {
      chunk = this._decoder.write(chunk)
    }

    // Exit on CTRL + C.
    if (chunk === '\u0003') {
      process.exit()
    }

    // Uppercase lowercase letters.
    if (chunk >= 'a' && chunk <= 'z') {
      chunk = chunk.toUpperCase()
    }

    // Pass the chunk on.
    callback(null, chunk)
  }
}

// pipeline() is new in Node 10
pipeline(
  process.stdin,
  new UppercaseCharacters(),
  process.stdout,
  err => {
    if (err) {
      console.log('Pipeline failed: ')
    } else {
      console.log('Pipeline succeeded.')
    }
  }
)


// Example 4: https://ar.al/2018/12/20/a-simple-node-transform-stream-with-the-new-node-10-pipeline-function/

const { Transform } = require('stream')

class chunkCorrector extends Transform {
  constructor(options) {
    super (options)

    // The stream will have Buffer chunks. The
    // decoder converts these to String instances.
    this.data = null;
    this.counter = 0;
  }

  _transform (chunk, encoding, callback) {

    this.counter += 1;
    console.log(counter);

    if(this.counter === 1) {
        this.data = chunk
    }

    else {
        this.data = chunk
    }

    // Pass the chunk on.
    callback(null, chunk)
  }
}

class chunkCorrector extends Transform {
    constructor(options) {
      super (options)
  
      // The stream will have Buffer chunks. The
      // decoder converts these to String instances.
      this.data = null;
      this.counter = 0;
    }
  
    _transform (chunk, encoding, callback) {
  
      this.counter += 1;
      console.log(this.counter);
  
      if(this.counter === 1) {
          this.data = chunk
          callback(null);
          //console.log(this.data.slice(1));
          //console.log(this.data.length);
      }
  
      else {
          this.data = chunk
          // Pass the chunk on.
          callback(null, chunk)
      }
  
      

    }
}

let chunkCorr = new chunkCorrector()
*/

// Example 5: Readable

/*
var Readable = require('stream').Readable;
var rs = Readable();

var c = 97 - 1;

rs._read = function () {
    if (c >= 'z'.charCodeAt(0)) return rs.push(null);

    setTimeout(function () {
        rs.push(String.fromCharCode(++c));
    }, 100);
};

rs.pipe(process.stdout);

process.on('exit', function () {
    console.error('\n_read() called ' + (c - 97) + ' times');
});
process.stdout.on('error', process.exit);
*/