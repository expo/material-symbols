// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add xml as an asset extension so Android vector drawables can be require()'d
config.resolver.assetExts.push('xml');

// Watch the monorepo root so Metro can resolve hoisted deps and the library
config.watchFolders = [path.join(__dirname, '..')];

module.exports = config;
