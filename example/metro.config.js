// Learn more https://docs.expo.io/guides/customizing-metro
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Watch the monorepo root so Metro can resolve hoisted deps and the library
config.watchFolders = [path.join(__dirname, "..")];

module.exports = config;
