# @expo/material-symbols

[Material Symbols](https://fonts.google.com/icons) icon library for Expo/React Native Android. Icons are Android XML vector drawables, imported as Metro assets and rendered via `@expo/ui`. Only the icons you import are bundled — each icon lives at its own subpath (`@expo/material-symbols/star`), so unused icons are never resolved by Metro.

Only the **outlined** style is shipped at the moment. For rounded or sharp styles, see [Using custom XML icons](#using-custom-xml-icons).

## Installation

```bash
bun add @expo/material-symbols
```

### Metro config

Add `xml` to Metro's asset extensions so vector drawables can be imported:

```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("xml");

module.exports = config;
```

## Usage

Each icon is imported from its own subpath:

```tsx
import { Host, Icon } from "@expo/ui/jetpack-compose";
import { Star } from "@expo/material-symbols/star";
import { Home } from "@expo/material-symbols/home";

<Host matchContents>
  <Icon source={Star} size={32} />
</Host>;
```

`<Host matchContents>` is required — without it the Compose host has 0×0 size.

## How it works

- `generate.ts` downloads the [Iconify material-symbols](https://github.com/iconify/icon-sets) set, filters to outlined style, converts SVGs to Android vector drawables (`icons/*.xml`), and generates per-icon TypeScript modules (`modules/*.ts`).
- Each module does `export const Star = require('../icons/star.xml')`, giving Metro a numeric asset ID.
- The `@expo/ui` `<Icon>` component resolves the asset and renders it natively via Jetpack Compose.
- Icons and modules are generated at install time via the `prepare` script and are gitignored.

## Using custom XML icons

You can use your own Android XML vector drawables. Place them anywhere in your project, ensure `xml` is in Metro's `assetExts`, and import them:

```tsx
import { Host, Icon } from "@expo/ui/jetpack-compose";

const MyIcon = require("./assets/my-icon.xml");

<Host matchContents>
  <Icon source={MyIcon} size={32} />
</Host>;
```

This works for rounded, sharp, or any custom Material Symbols style — just export the SVG from [Google Fonts](https://fonts.google.com/icons) and convert it to an Android vector drawable.

## Development

```bash
bun install
cd packages/expo-material-symbols && bun run generate  # regenerate icons
cd example && bun run android                           # run the example app
```
