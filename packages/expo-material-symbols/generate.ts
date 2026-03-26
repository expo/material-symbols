import {
  parseIconSet,
  iconToSVG,
  iconToHTML,
  type IconifyIcon,
} from "@iconify/utils";
import { svgToVectorDrawable } from "./svg-to-vector-drawable";
import { mkdir, writeFile } from "fs/promises";
import type { IconifyJSON } from "@iconify/types";

const ICONS_DIR = "./icons";
const MODULES_DIR = "./modules";
const ICON_SET_PATH = "./material-symbols.json";

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

/** Keep only outlined style — filter out -rounded and -sharp suffixes */
function isOutlinedStyle(name: string): boolean {
  return !name.endsWith("-rounded") && !name.endsWith("-sharp");
}

async function main() {
  const file = Bun.file(ICON_SET_PATH);
  if (!(await file.exists())) {
    throw new Error(
      `${ICON_SET_PATH} not found. Run "bun run update-icons" to download it.`,
    );
  }
  const iconSet = (await file.json()) as IconifyJSON;

  await mkdir(ICONS_DIR, { recursive: true });
  await mkdir(MODULES_DIR, { recursive: true });

  // Collect outlined-style icons only
  const icons: { name: string; data: IconifyIcon }[] = [];

  parseIconSet(iconSet, (name, data) => {
    if (!data) return;
    if (isOutlinedStyle(name)) {
      icons.push({ name, data });
    }
  });

  console.log(`Processing ${icons.length} outlined icons...`);

  // Generate XML files and per-icon modules
  const exports: { fileName: string; exportName: string }[] = [];

  for (const { name, data } of icons) {
    const svg = iconToSVG(data);
    const svgString = iconToHTML(svg.body, svg.attributes);
    const xml = svgToVectorDrawable(svgString);

    const fileName = toFileName(name);
    await writeFile(`${ICONS_DIR}/${fileName}.xml`, xml);
    await writeFile(
      `${MODULES_DIR}/${fileName}.ts`,
      `export const ${toPascalCase(name)} = require('../icons/${fileName}.xml');\n`,
    );

    exports.push({
      fileName,
      exportName: toPascalCase(name),
    });
  }

  console.log(`Generated ${exports.length} icons and modules`);
}

main().catch(console.error);
