const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

global.TextEncoder = require("text-encoding").TextEncoder;

const config = getDefaultConfig(__dirname);



config.resolver.extraNodeModules.crypto = require.resolve(
  "react-native-get-random-values"
);

config.resolver.extraNodeModules.crypto = require.resolve("expo-crypto");

module.exports = withNativeWind(config, { input: "./global.css" });
