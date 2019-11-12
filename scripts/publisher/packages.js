const { readFile } = require('fs');
const shell = require('shelljs');
const path = require('path');

const { logger } = require('./utils');
const { bitList } = require('./bit');
const { getRegistry } = require('./manageNPMRC');
const { getFilePath } = require('./config');

const getPkgVersionAsync = pkd =>
  new Promise(resolve => {
    const filePath = getFilePath();
    const versionPath = path.resolve(`${filePath}/${pkd.name}/package.json`);
    logger(`Reading version from ${versionPath}`);
    readFile(versionPath, (err, data) => {
      if (err) resolve(null);
      else {
        const { version } = JSON.parse(data.toString('utf8'));
        logger(`Current version installed for ${pkd.name} is @${version}`);
        resolve(version);
      }
    });
  });

exports.getPkgVersion = (pkd, silent = false) => {
  let versionMatched = null;
  const filePath = getFilePath();
  const versionPath = path.resolve(`${filePath}/${pkd.name}/package.json`);
  const localVersion = shell.exec(`awk '/version.*:/' ${versionPath}`, { silent: true });
  if (localVersion.code === 0) {
    versionMatched = localVersion.match(/\d+\.\d+\.\d+/g).toString();
    if (!silent) logger(`Current version installed for ${pkd.name} is @${versionMatched}`);
  }

  return versionMatched;
};

exports.existPkg = pkg =>
  new Promise(resolve => {
    const registry = getRegistry();
    logger(`Verify ${pkg.name}@${pkg.version} on ${registry}`);
    shell.exec(`npm view --registry=${registry} ${pkg.name} versions`, { silent: true }, (code, stdout, stderr) => {
      if (code === 0 || stderr.includes('npm ERR! 404')) {
        logger(`Result for ${pkg.name}@${pkg.version} is ${stdout}`);
        resolve({ name: pkg.name, published: stdout.includes(pkg.version) });
      } else {
        logger(`Result for ${pkg.name}@${pkg.version} is ${stderr}`);
        resolve({ name: pkg.name, published: true });
      }
    });
  });

exports.publishPkg = pkg =>
  new Promise(resolve => {
    const registry = getRegistry();
    const sourceFilePath = getFilePath();
    logger(`Publishing ${pkg.name} on ${registry}`);
    shell.exec(
      `npm publish --registry=${registry} ${sourceFilePath}/${pkg.name}`,
      { silent: true },
      (code, stdout, stderr) => {
        logger(
          `${pkg.name}@${pkg.version} ${code === 0 ? 'published successfully ✔️' : `not published ❌ \n${stderr}\n`}`
        );
        resolve(code);
      }
    );
  });

exports.installLatestPkg = packages =>
  new Promise(resolve => {
    const allPackages = packages.reduce((acc, el) => `${acc} ${el.name}@${el.version}`, '');
    if (allPackages) {
      logger(`Installing ${packages.length} packages ${allPackages.replace(/ /g, '\n')}`);
      shell.exec(`npm install ${allPackages}`, { silent: true }, (code, stdout, stderr) => {
        if (code === 0) logger(`Successfully installed ${packages.length} packages ${allPackages.replace(/ /g, '\n')}`);
        else logger(`There are errors in the package instalation: ${stderr}`);
        resolve(code);
      });
    } else {
      logger(`Nothing to install, all up to date in node_modules.`);
      resolve();
    }
  });

exports.getDiffPkgVersions = async () => {
  const packages = await bitList();
  const promisePackages = packages.map(async pkg => {
    const copyPkg = { ...pkg };
    copyPkg.name = copyPkg.name.replace('/', '.');
    const localVersion = this.getPkgVersion(copyPkg);
    if (localVersion !== copyPkg.version) {
      copyPkg.name = `@bit/${copyPkg.name}`;
      return copyPkg;
    }
    return 0;
  });

  return promisePackages;
};
