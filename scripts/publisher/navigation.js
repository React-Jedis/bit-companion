const shell = require('shelljs');
const path = require('path');

const EXECUTED_FROM = path.resolve('./');

exports.toScript = () => shell.cd(__dirname);

exports.returnHome = () => shell.cd(EXECUTED_FROM);

exports.whereIAm = () => shell.ls('./');
