const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Configure for web compatibility
config.transformer = {
    ...config.transformer,
    unstable_allowRequireContext: true,
};

// Ensure proper handling of import.meta for web
config.resolver = {
    ...config.resolver,
};

module.exports = withNativeWind(config, { input: "./global.css" });
