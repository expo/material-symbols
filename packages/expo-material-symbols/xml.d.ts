// Types for icon subpath imports (e.g. `import Home from '@expo/material-symbols/home.xml'`).
// Wired via the `types` condition in package.json `exports`, so TS uses this file as the
// module type for every resolved subpath. Metro returns an asset id (number) at runtime.
declare const src: number;
export default src;
