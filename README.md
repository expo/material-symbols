# @expo/material-symbols

[Material Symbols](https://fonts.google.com/icons) icon library for Expo/React Native Android. Icons are Android XML vector drawables, imported as Metro assets and rendered via `@expo/ui`. Only the icons you import are bundled — each icon lives at its own subpath (`@expo/material-symbols/star`), so unused icons are never resolved by Metro.

Only the **outlined** style is shipped at the moment. For rounded or sharp styles, see [Using custom XML icons](#using-custom-xml-icons).

## Installation

```bash
bun add @expo/material-symbols
```

## Usage

Each icon is imported from its own subpath:

```tsx
import { Host, Icon } from "@expo/ui/jetpack-compose";
import { Star } from "@expo/material-symbols/star";
import { Home } from "@expo/material-symbols/home";

<Host matchContents>
  <Icon source={Star} size={32} tintColor="#007AFF" />
</Host>;
```

- **`size`** — icon size in dp
- **`tintColor`** — any React Native `ColorValue` (hex, named color, etc.). Overrides the XML's fill color at runtime.
- **`<Host matchContents>`** is required — without it the Compose host has 0×0 size.

## How it works

- `generate.ts` downloads the [Iconify material-symbols](https://github.com/iconify/icon-sets) set, filters to outlined style, converts SVGs to Android vector drawables (`icons/*.xml`), and generates per-icon TypeScript modules (`modules/*.ts`).
- Each module does `export const Star = require('../icons/star.xml')`, giving Metro a numeric asset ID.
- The `@expo/ui` `<Icon>` component resolves the asset and renders it natively via Jetpack Compose.
- Icons and modules are generated at install time via the `prepare` script and are gitignored.

## CLI: adding individual icons

The `add-icon` CLI downloads Material Symbols icons as Android XML vector drawables. This is useful when you want specific styles or axis values (fill, weight, grade, optical size) beyond the default outlined set.

```bash
# By name (defaults: outlined, weight 400, no fill, grade 0, 24px)
npx add-icon search

# Multiple icons at once
npx add-icon search star home

# Rounded style
npx add-icon --style rounded search star

# Sharp + filled
npx add-icon --style sharp --fill favorite

# Custom weight
npx add-icon --weight 300 star

# From a Google Fonts URL (preserves the axes you picked in the UI)
npx add-icon "https://fonts.google.com/icons?selected=Material+Symbols+Outlined:check_box:FILL@1;wght@300;GRAD@0;opsz@24"

# Custom output directory
npx add-icon -o ./my-icons search
```

| Option                  | Description                                    | Default     |
| ----------------------- | ---------------------------------------------- | ----------- |
| `-o, --output <dir>`    | Output directory                               | `./assets`  |
| `-s, --style <style>`   | Icon style: `outlined`, `rounded`, `sharp`     | `outlined`  |
| `-f, --fill`            | Use filled variant                             |             |
| `-w, --weight <wght>`   | Weight: 100–700                                | `400`       |
| `-g, --grade <grad>`    | Grade: -25, 0, 200                             | `0`         |
| `--opsz <size>`         | Optical size: 20, 24, 40, 48                   | `24`        |
| `-h, --help`            | Show help                                      |             |

The output is a ready-to-use XML vector drawable that you can import directly (see [Using custom XML icons](#using-custom-xml-icons)).

## Using custom XML icons

You can use your own Android XML vector drawables. Place them anywhere in your project and import them:

```tsx
import { Host, Icon } from "@expo/ui/jetpack-compose";

const MyIcon = require("./assets/my-icon.xml");

<Host matchContents>
  <Icon source={MyIcon} size={32} />
</Host>;
```

This works for rounded, sharp, or any custom Material Symbols style — just export the SVG from [Google Fonts](https://fonts.google.com/icons) and convert it to an Android vector drawable.

## Credits

The icon SVGs are from Google's [Material Symbols](https://github.com/google/material-design-icons), licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). Icon data is sourced via the [Iconify icon-sets](https://github.com/iconify/icon-sets) collection.

## Development

```bash
bun install
cd packages/expo-material-symbols && bun run generate  # regenerate icons
cd example && bun run android                           # run the example app
```
