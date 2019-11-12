const shell = require('shelljs');
const path = require('path');
const { logger } = require('./utils');

const NPMRC_TEMPLATES = path.resolve(`${__dirname}/../../templates/npmrc/`);

exports.createBackup = () => {
  shell.cp('~/.npmrc', '~/.npmrc_backup');
  logger('.npmrc backup created.');
};

exports.restoreBackup = () => {
  shell.cp('~/.npmrc_backup', '~/.npmrc');
  logger('Restored .npmrc');
};

exports.swapToInner = () => {
  shell.cp(`${NPMRC_TEMPLATES}/inner.txt`, '~/.npmrc');
  logger('.npmrc now on inner mode');
};

exports.swapToOuter = () => {
  shell.cp(`${NPMRC_TEMPLATES}/outer.txt`, '~/.npmrc');
  logger('.npmrc now on outer mode');
};

exports.getRegistry = () => {
  const registries = shell
    .exec("awk '/^registry=/' ~/.npmrc", { silent: true })
    .stdout.split('\n')
    .filter(registry => registry.startsWith('registry=') || registry.startsWith('@bit:registry='))
    .map(registry => registry.slice(registry.indexOf('=') + 1, registry.length));
  return registries[registries.length - 1];
};
