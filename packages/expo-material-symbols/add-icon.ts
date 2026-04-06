#!/usr/bin/env node
import { parseArgs } from "util";
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
 * See: https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/{name}/{axis}/{opsz}px.xml
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

export async function downloadXml(params: IconParams): Promise<string> {
  const axis = buildAxisSegment(params);
  const gstaticStyle = `materialsymbols${params.style}`;
  const url = `${GSTATIC_BASE}/${gstaticStyle}/${params.name}/${axis}/${params.opsz}px.xml`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `Icon "${params.name}" not found (404).\nURL: ${url}\nCheck the icon name and try again.`,
      );
    }
    throw new Error(`Failed to download icon: HTTP ${response.status}\nURL: ${url}`);
  }

  return response.text();
}

const VALID_STYLES: IconStyle[] = ["outlined", "rounded", "sharp"];

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      output: { type: "string", short: "o", default: "./assets" },
      style: { type: "string", short: "s", default: "outlined" },
      fill: { type: "boolean", short: "f", default: false },
      weight: { type: "string", short: "w", default: "400" },
      grade: { type: "string", short: "g", default: "0" },
      opsz: { type: "string", default: "24" },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help || positionals.length === 0) {
    console.log(`Usage: add-icon [options] <icon-names-or-urls...>

Downloads Material Symbols icons from Google Fonts as Android XML vector drawables.

Arguments:
  <icon-names-or-urls...>   One or more icon names or Google Fonts URLs

Options:
  -o, --output <dir>        Output directory (default: ./assets)
  -s, --style <style>       Icon style: outlined, rounded, sharp (default: outlined)
  -f, --fill                Use filled variant (default: outline)
  -w, --weight <wght>       Weight: 100-700 (default: 400)
  -g, --grade <grad>        Grade: -25, 0, 200 (default: 0)
      --opsz <size>         Optical size: 20, 24, 40, 48 (default: 24)
  -h, --help                Show this help message

Examples:
  npx add-icon search star home
  npx add-icon --style rounded --fill search
  npx add-icon -s sharp -w 300 star
  npx add-icon "https://fonts.google.com/icons?selected=Material+Symbols+Outlined:search:FILL@0;wght@400;GRAD@0;opsz@24"`);
    process.exit(values.help ? 0 : 1);
  }

  const style = values.style as IconStyle;
  if (!VALID_STYLES.includes(style)) {
    console.error(`Invalid style "${style}". Must be one of: ${VALID_STYLES.join(", ")}`);
    process.exit(1);
  }

  const defaults: Omit<IconParams, "name"> = {
    style,
    fill: values.fill ? 1 : 0,
    wght: Number(values.weight),
    grad: Number(values.grade),
    opsz: Number(values.opsz),
  };

  const outputDir = values.output!;
  await mkdir(outputDir, { recursive: true });

  const results = await Promise.allSettled(
    positionals.map(async (input) => {
      const params: IconParams = input.startsWith("http")
        ? parseIconUrl(input)
        : { name: normalizeIconName(input), ...defaults };

      const xml = await downloadXml(params);
      const fileName = toFileName(params);
      const outputPath = resolve(outputDir, `${fileName}.xml`);
      await writeFile(outputPath, xml);
      await writeFile(
        resolve(outputDir, `${fileName}.d.xml.ts`),
        "declare const value: number;\nexport default value;\n",
      );
      return fileName;
    }),
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      console.log(`Saved ${result.value}.xml`);
    } else {
      console.error(result.reason.message);
    }
  }

  if (results.some((r) => r.status === "rejected")) {
    process.exit(1);
  }
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
