---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

## Project

expo-material-symbols is a tree-shakeable Material Symbols icon library for Expo/React Native Android. It generates Android XML vector drawables from Material Symbols and lets Metro tree-shake to only the icons actually imported.

### Structure (monorepo)

```
packages/expo-material-symbols/   # the library
  icons/*.xml                     # generated Android vector drawables
  modules/*.ts                    # one re-export per icon: `export const Home = require('../icons/home.xml')`
  index.ts                        # barrel export
  generate.ts                     # icon generation script (svg → xml)
example/                          # test Expo app
  metro.config.js                 # watchFolders=[monorepo root], assetExts includes 'xml'
  src/app/icons.tsx               # test screen rendering icons
```

### How icons render

Icons are consumed via `@expo/ui/jetpack-compose`'s `<Icon>` component on Android:

```tsx
import { Host, Icon } from "@expo/ui/jetpack-compose";
import { Star } from "expo-material-symbols";

<Host matchContents>
  <Icon source={Star} size={32} />
</Host>;
```

`source` takes the Metro asset ID from `require('./icon.xml')`. The `<Icon>` component calls `Image.resolveAssetSource(source)` and passes the resolved URI to the native `ExpoUI` `IconView`. `<Host matchContents>` is required — without it the Compose host has 0×0 size.

### Verification

```bash
cd example
EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1 EXPO_UNSTABLE_TREE_SHAKING=1 npx expo export --platform android --dump-assetmap --no-bytecode
```

Should show only the imported XML icons in the asset map (tree-shaking works).

---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.
