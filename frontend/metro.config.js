const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.unstable_enablePackageExports = true;

config.resolver.alias = {
  '@': __dirname + '/src',
};

config.watchFolders = [__dirname];

module.exports = config;