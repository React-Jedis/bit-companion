const { createBackup, restoreBackup, swapToInner, swapToOuter, getRegistry } = require('./manageNPMRC');
const { logger, toLogFile } = require('./utils');
const { getBitNodeModules } = require('./bit');
const { existPkg, publishPkg, installLatestPkg, getDiffPkgVersions, getPkgVersion } = require('./packages');
const { toScript } = require('./navigation');

const main = async () => {
  const bitDirectories = getBitNodeModules();

  const existsPromises = await Promise.all(
    bitDirectories.map(dirent =>
      existPkg({ name: `@bit/${dirent.name}`, version: getPkgVersion({ name: dirent.name }, true) })
    )
  );

  const pkgToPublish = await Promise.all(existsPromises.filter(pkg => !pkg.published));

  if (pkgToPublish.length > 0) {
    await Promise.all(
      pkgToPublish.map(pkg => {
        const copy = { ...pkg };
        copy.name = pkg.name.replace('@bit/', '');
        copy.version = getPkgVersion(copy, true);
        return publishPkg(copy);
      })
    );
  } else {
    logger(`Nothing to publish, all packages are already available on ${getRegistry()}`);
  }
};

exports.execute = async () => {
  try {
    logger("Don't touch anything, publishing...");

    const promisePackages = await getDiffPkgVersions();
    const packagesToInstall = await Promise.all(promisePackages).then(results => results.filter(pkg => pkg !== 0));

    createBackup();
    swapToOuter();
    toScript();
    await installLatestPkg(packagesToInstall);
    swapToInner();
    await main(packagesToInstall);
    restoreBackup();
  } catch (e) {
    logger(e);
  } finally {
    await toLogFile();
  }
};
