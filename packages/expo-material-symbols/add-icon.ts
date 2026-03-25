#!/usr/bin/env node
import { parseArgs } from "util";
import { SVG, cleanupSVG, parseColors, isEmptyColor, resetSVGOrigin, scaleSVG, runSVGO } from "@iconify/tools";
import { svgToVectorDrawable } from "./svg-to-vector-drawable";
import { mkdir, writeFile } from "fs/promises";
import { resolve } from "path";

const GSTATIC_BASE = "https://fonts.gstatic.com/s/i/short-term/release";

export type IconStyle = "outlined" | "rounded" | "sharp";

export interface IconParams {
  name: string;
  style: IconStyle;
  fill: number;
  wght: number;
  grad: number;
  opsz: number;
}

const STYLE_MAP: Record<string, IconStyle> = {
  "Material+Symbols+Outlined": "outlined",
  "Material Symbols Outlined": "outlined",
  "Material+Symbols+Rounded": "rounded",
  "Material Symbols Rounded": "rounded",
  "Material+Symbols+Sharp": "sharp",
  "Material Symbols Sharp": "sharp",
};

export function parseIconUrl(url: string): IconParams {
  const parsed = new URL(url);
  const selected = parsed.searchParams.get("selected");
  if (!selected) {
    throw new Error(
      `Invalid URL: missing "selected" query parameter.\nExpected: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:<icon_name>:...`,
    );
  }

  // Format: Material+Symbols+Outlined:search:FILL@0;wght@400;GRAD@0;opsz@24
  const parts = selected.split(":");
  if (parts.length < 2 || !parts[1]) {
    throw new Error(
      `Could not parse icon name from "selected=${selected}".\nExpected format: Material+Symbols+Outlined:<icon_name>:...`,
    );
  }

  const style = STYLE_MAP[parts[0]!] ?? "outlined";
  const name = parts[1];
  const defaults: IconParams = { name, style, fill: 0, wght: 400, grad: 0, opsz: 24 };

  if (parts.length < 3) return defaults;

  // Parse axis values: FILL@0;wght@400;GRAD@0;opsz@24
  const axes = parts[2]!.split(";");
  for (const axis of axes) {
    const [key, val] = axis.split("@");
    if (!key || val === undefined) continue;
    const k = key.toLowerCase();
    const v = Number(val);
    if (k === "fill") defaults.fill = v;
    else if (k === "wght") defaults.wght = v;
    else if (k === "grad") defaults.grad = v;
    else if (k === "opsz") defaults.opsz = v;
  }

  return defaults;
}

/**
 * Build the gstatic axis segment. The API accepts one non-default axis or "default".
 * When all axes are default, use "default". Otherwise use the first non-default axis.
 * See: https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/{name}/{axis}/{opsz}px.svg
 */
export function buildAxisSegment(params: IconParams): string {
  // Check non-default axes
  if (params.fill === 1) return "fill1";
  if (params.wght !== 400) return `wght${params.wght}`;
  if (params.grad !== 0) {
    return params.grad < 0 ? `gradN${Math.abs(params.grad)}` : `grad${params.grad}`;
  }
  return "default";
}

/** Normalize a human-typed icon name to the gstatic API format (lowercase, underscores). */
export function normalizeIconName(name: string): string {
  return name.toLowerCase().replace(/[\s-]+/g, "_");
}

export function toFileName(params: IconParams): string {
  const base = params.name.replace(/-/g, "_");
  const suffixes: string[] = [];

  if (params.style !== "outlined") suffixes.push(params.style);
  if (params.fill === 1) suffixes.push("fill");
  if (params.wght !== 400) suffixes.push(`wght${params.wght}`);
  if (params.grad !== 0) suffixes.push(`grad${params.grad}`);

  return suffixes.length > 0 ? `${base}_${suffixes.join("_")}` : base;
}

/**
 * Clean up a raw SVG using the same pipeline Iconify uses to normalize icons:
 * 1. cleanupSVG — remove dead code, bad attributes, convert styles to attrs
 * 2. parseColors — replace hardcoded colors with currentColor
 * 3. resetSVGOrigin — shift viewBox origin to (0,0) (gstatic uses "0 -960 960 960")
 * 4. scaleSVG — scale to 24×24 viewBox (gstatic uses 960×960)
 * 5. runSVGO — optimize paths and attributes
 */
export async function cleanupSvg(raw: string): Promise<string> {
  const svg = new SVG(raw);
  cleanupSVG(svg);
  parseColors(svg, {
    defaultColor: "currentColor",
    callback: (_attr, colorStr, color) => {
      return !color || isEmptyColor(color) ? colorStr : "currentColor";
    },
  });
  resetSVGOrigin(svg);

  // Scale to 24×24 to match Iconify's coordinate system
  const viewBox = svg.viewBox;
  if (viewBox.width !== 24) {
    scaleSVG(svg, 24 / viewBox.width);
  }

  await runSVGO(svg);
  return svg.toMinifiedString();
}

export async function downloadSvg(params: IconParams): Promise<string> {
  const axis = buildAxisSegment(params);
  const gstaticStyle = `materialsymbols${params.style}`;
  const url = `${GSTATIC_BASE}/${gstaticStyle}/${params.name}/${axis}/${params.opsz}px.svg`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `Icon "${params.name}" not found (404).\nURL: ${url}\nCheck the icon name and try again.`,
      );
    }
    throw new Error(`Failed to download icon: HTTP ${response.status}\nURL: ${url}`);
  }

  const raw = await response.text();
  return cleanupSvg(raw);
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      output: { type: "string", short: "o", default: "./assets" },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help || positionals.length === 0) {
    console.log(`Usage: add-icon [options] <url-or-icon-name>

Downloads a Material Symbols icon from Google Fonts and saves it as an Android XML vector drawable.

Arguments:
  <url-or-icon-name>   Google Fonts icon URL or plain icon name (e.g. "search")

Options:
  -o, --output <dir>   Output directory (default: ./assets)
  -h, --help           Show this help message

Examples:
  npx add-icon "https://fonts.google.com/icons?selected=Material+Symbols+Outlined:search:FILL@0;wght@400;GRAD@0;opsz@24"
  npx add-icon search
  npx add-icon -o ./my-icons star`);
    process.exit(values.help ? 0 : 1);
  }

  const input = positionals[0]!;
  const params: IconParams = input.startsWith("http")
    ? parseIconUrl(input)
    : { name: normalizeIconName(input), style: "outlined" as IconStyle, fill: 0, wght: 400, grad: 0, opsz: 24 };

  const svgString = await downloadSvg(params);
  const xml = svgToVectorDrawable(svgString);

  const outputDir = values.output!;
  await mkdir(outputDir, { recursive: true });

  const fileName = toFileName(params);
  const outputPath = resolve(outputDir, `${fileName}.xml`);
  await writeFile(outputPath, xml);

  console.log(`Saved ${fileName} → ${outputPath}`);
}

// Only run CLI when executed directly (not when imported by tests)
const isMain =
  typeof import.meta.main === "boolean"
    ? import.meta.main // Bun
    : process.argv[1]?.includes("add-icon"); // Node
if (isMain) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
