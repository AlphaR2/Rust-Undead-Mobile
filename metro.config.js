const { getDefaultConfig } = require('expo/metro-config')

global.TextEncoder = require('text-encoding').TextEncoder

const config = getDefaultConfig(__dirname)

config.resolver.extraNodeModules.crypto = require.resolve('react-native-get-random-values')

config.resolver.extraNodeModules.crypto = require.resolve('expo-crypto')

const { transformer, resolver } = config

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
}

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  extraNodeModules: {
    ...resolver.extraNodeModules,
    crypto: require.resolve('expo-crypto'),
  },
}

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  if (moduleName === 'isows') {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    }
    return ctx.resolveRequest(ctx, moduleName, platform)
  }

  if (moduleName.startsWith('zustand')) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    }
    return ctx.resolveRequest(ctx, moduleName, platform)
  }

  if (moduleName === 'jose') {
    const ctx = {
      ...context,
      unstable_conditionNames: ['browser'],
    }
    return ctx.resolveRequest(ctx, moduleName, platform)
  }

  return context.resolveRequest(context, moduleName, platform)
}

config.resolver.resolveRequest = resolveRequestWithPackageExports

module.exports = config
