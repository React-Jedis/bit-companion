const { writeFile } = require('fs');
const shell = require('shelljs');

const LOG_FILE_PATH = `${__dirname}/logs/`;
const LOG_FILE_NAME = `publisher-${new Date().valueOf()}.log`;
const LOG_FILE = `${LOG_FILE_PATH}/${LOG_FILE_NAME}`;

shell.mkdir(LOG_FILE_PATH);

let LOG_BUFFER = '';

exports.twirlTimer = function() {
  const P = ['\\', '|', '/', '-'];
  let x = 0;
  return setInterval(function() {
    process.stdout.write('\r' + P[x++]);
    x &= 3;
  }, 250);
};

exports.logger = (text, verbose = true) => {
  const displayText = `${text}\n`;
  if (verbose) console.log(displayText);
  LOG_BUFFER += displayText;
};

exports.toLogFile = () =>
  new Promise(resolve =>
    writeFile(LOG_FILE, LOG_BUFFER, 'utf8', () => {
      resolve(1);
    })
  );
