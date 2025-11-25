module.exports = {
  hooks: {
    readPackage(pkg) {
      // Force ws to patched version
      if (pkg.dependencies && pkg.dependencies.ws) {
        if (pkg.dependencies.ws.match(/^[\^~]?8\./)) {
          pkg.dependencies.ws = '8.17.1';
        }
      }
      if (pkg.devDependencies && pkg.devDependencies.ws) {
        if (pkg.devDependencies.ws.match(/^[\^~]?8\./)) {
          pkg.devDependencies.ws = '8.17.1';
        }
      }

      // Force tar-fs to patched version
      if (pkg.dependencies && pkg.dependencies['tar-fs']) {
        const tarFsVersion = pkg.dependencies['tar-fs'];
        if (tarFsVersion.match(/^[\^~]?3\./)) {
          pkg.dependencies['tar-fs'] = '3.1.1';
        } else if (tarFsVersion.match(/^[\^~]?2\./)) {
          pkg.dependencies['tar-fs'] = '2.1.4';
        }
      }
      if (pkg.devDependencies && pkg.devDependencies['tar-fs']) {
        const tarFsVersion = pkg.devDependencies['tar-fs'];
        if (tarFsVersion.match(/^[\^~]?3\./)) {
          pkg.devDependencies['tar-fs'] = '3.1.1';
        } else if (tarFsVersion.match(/^[\^~]?2\./)) {
          pkg.devDependencies['tar-fs'] = '2.1.4';
        }
      }

      // Force glob to patched version
      if (pkg.dependencies && pkg.dependencies.glob) {
        const globVersion = pkg.dependencies.glob;
        if (globVersion.match(/^[\^~]?10\./)) {
          pkg.dependencies.glob = '10.5.0';
        } else if (globVersion.match(/^[\^~]?11\./)) {
          pkg.dependencies.glob = '11.1.0';
        }
      }
      if (pkg.devDependencies && pkg.devDependencies.glob) {
        const globVersion = pkg.devDependencies.glob;
        if (globVersion.match(/^[\^~]?10\./)) {
          pkg.devDependencies.glob = '10.5.0';
        } else if (globVersion.match(/^[\^~]?11\./)) {
          pkg.devDependencies.glob = '11.1.0';
        }
      }

      // Force cookie to patched version
      if (pkg.dependencies && pkg.dependencies.cookie) {
        if (pkg.dependencies.cookie.match(/^[\^~]?0\./)) {
          pkg.dependencies.cookie = '0.7.0';
        }
      }
      if (pkg.devDependencies && pkg.devDependencies.cookie) {
        if (pkg.devDependencies.cookie.match(/^[\^~]?0\./)) {
          pkg.devDependencies.cookie = '0.7.0';
        }
      }

      // Force tmp to patched version
      if (pkg.dependencies && pkg.dependencies.tmp) {
        if (pkg.dependencies.tmp.match(/^[\^~]?0\.2\./)) {
          pkg.dependencies.tmp = '0.2.4';
        }
      }
      if (pkg.devDependencies && pkg.devDependencies.tmp) {
        if (pkg.devDependencies.tmp.match(/^[\^~]?0\.2\./)) {
          pkg.devDependencies.tmp = '0.2.4';
        }
      }

      return pkg;
    }
  }
};

