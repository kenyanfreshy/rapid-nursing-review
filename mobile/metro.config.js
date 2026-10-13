// Bundle the offline web app's index.html as an asset (webp is already an asset type).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('html');
module.exports = config;
