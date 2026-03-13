import { parseIconSet, iconToSVG, iconToHTML, type IconifyIcon } from "@iconify/utils";
import svg2vectordrawable from "svg2vectordrawable";
import { mkdir, writeFile } from "fs/promises";

const ICONS_DIR = "./icons";
const JSON_URL =
  "https://raw.githubusercontent.com/iconify/icon-sets/master/json/material-symbols.json";

// Specific icons to generate (use null to just take the first N)
const WANTED_ICONS: string[] | null = [
  "star",
  "home",
  "search",
  "settings",
  "favorite",
  "close",
  "menu",
  "check",
  "arrow-back",
  "arrow-forward",
];

function toPascalCase(str: string): string {
  const pascal = str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  // Prefix with underscore if starts with digit
  return /^\d/.test(pascal) ? `_${pascal}` : pascal;
}

function toFileName(name: string): string {
  return name.replace(/-/g, "_");
}

async function main() {
  console.log("Downloading material-symbols.json...");
  const response = await fetch(JSON_URL);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
  const iconSet = await response.json();

  await mkdir(ICONS_DIR, { recursive: true });

  // Collect icons
  const icons: { name: string; data: IconifyIcon }[] = [];
  const wantedSet = WANTED_ICONS ? new Set(WANTED_ICONS) : null;

  parseIconSet(iconSet, (name, data) => {
    if (!data) return;
    if (wantedSet) {
      if (wantedSet.has(name)) icons.push({ name, data });
    } else {
      if (icons.length < 10) icons.push({ name, data });
    }
  });

  if (wantedSet) {
    const found = new Set(icons.map((i) => i.name));
    const missing = WANTED_ICONS!.filter((n) => !found.has(n));
    if (missing.length) console.warn(`Warning: icons not found: ${missing.join(", ")}`);
  }

  console.log(`Processing ${icons.length} icons...`);

  // Generate XML files
  const exports: { fileName: string; exportName: string }[] = [];

  for (const { name, data } of icons) {
    const svg = iconToSVG(data);
    const svgString = iconToHTML(svg.body, svg.attributes);
    const xml = await svg2vectordrawable(svgString);

    const fileName = toFileName(name);
    await writeFile(`${ICONS_DIR}/${fileName}.xml`, xml);

    exports.push({
      fileName,
      exportName: toPascalCase(name),
    });

    console.log(`  ✓ ${fileName}.xml`);
  }

  // Sort exports alphabetically
  exports.sort((a, b) => a.exportName.localeCompare(b.exportName));

  // Generate per-icon modules (one file per icon for tree-shaking)
  await mkdir('./modules', { recursive: true });
  for (const e of exports) {
    await writeFile(
      `./modules/${e.fileName}.ts`,
      `export const ${e.exportName} = require('../icons/${e.fileName}.xml');\n`
    );
  }

  // Generate barrel index.ts with re-exports
  const indexLines = exports.map(
    (e) => `export { ${e.exportName} } from './modules/${e.fileName}';`
  );
  await writeFile("./index.ts", indexLines.join("\n") + "\n");
  console.log(`\nGenerated ${exports.length} modules + index.ts`);
}

main().catch(console.error);
