# expo/material-symbols

Monorepo for the [`@expo/material-symbols`](./packages/expo-material-symbols) package — a [Material Symbols](https://fonts.google.com/icons) icon library for Expo/React Native Android.

## Packages

- [`@expo/material-symbols`](./packages/expo-material-symbols) — the published package. See its [README](./packages/expo-material-symbols/README.md) for installation and usage.
- [`example`](./example) — example app exercising the package.

## Development

```bash
bun install
cd packages/expo-material-symbols && bun run generate  # regenerate icons
cd example && bun run android                          # run the example app
```
