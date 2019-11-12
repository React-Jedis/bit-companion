const { readdirSync } = require('fs');
const shell = require('shelljs');
const { logger } = require('./utils');
const { getFilePath } = require('./config');

exports.bitList = () =>
  new Promise(resolve => {
    const scope = 'bit-companion.bit-companion-ui';
    logger(`Listing all components in ${scope}`);
    shell.exec(`bit list ${scope} --raw`, { silent: true }, (code, stdout) => {
      const componentsList = stdout
        .split('\n')
        .filter(pkg => pkg.startsWith(scope))
        .map(pkg => {
          const myPkg = pkg.split('@');
          return { name: myPkg[0], version: myPkg[1] };
        });

      logger(`Components found on ${scope}:\n ${JSON.stringify(componentsList, null, 4)}`);
      resolve(componentsList);
    });
  });

exports.getBitNodeModules = () => {
  const sourcePath = getFilePath();
  return readdirSync(sourcePath, { withFileTypes: true }).filter(dirent => dirent.isDirectory());
};
