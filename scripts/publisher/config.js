const path = require('path');

const FILE_PATH = `${__dirname}/../../node_modules/@bit/`;

exports.getFilePath = () => path.resolve(FILE_PATH);
