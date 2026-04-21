import { mkdir, writeFile } from "fs/promises";

const ICONS_DIR = "./icons";
const METADATA_PATH = "./material-symbols-metadata.json";
// Per-icon .d.ts so TS errors on non-existent subpaths (wildcard exports alone can't
// verify the target exists). Content is identical for every icon; Metro returns an asset id.
const TYPE_FILE = "declare const src: number;\nexport default src;\n";
const METADATA_URL =
  "https://fonts.google.com/metadata/icons?incomplete=1&key=material_symbols";
const OUTLINED_FAMILY = "Material Symbols Outlined";
const OUTLINED_STYLE_SLUG = "materialsymbolsoutlined";
const DEFAULT_STYLE_SEGMENT = "default";
const DEFAULT_OPSZ = 24;

interface MetadataIcon {
  name: string;
  unsupported_families?: string[];
}

interface MetadataResponse {
  host: string;
  families: string[];
  icons: MetadataIcon[];
}

function stripMetadataPrefix(raw: string): string {
  return raw.startsWith(")]}'") ? raw.slice(4) : raw;
}

function toFileName(name: string): string {
  return name.replace(/-/g, "_");
}

async function loadMetadata(): Promise<MetadataResponse> {
  const metadataFile = Bun.file(METADATA_PATH);
  if (await metadataFile.exists()) {
    return (await metadataFile.json()) as MetadataResponse;
  }

  console.log(`Downloading metadata from ${METADATA_URL}...`);
  const response = await fetch(METADATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: HTTP ${response.status}`);
  }

  const metadata = JSON.parse(
    stripMetadataPrefix(await response.text()),
  ) as MetadataResponse;
  await Bun.write(METADATA_PATH, JSON.stringify(metadata, null, 2));
  return metadata;
}

function isOutlinedIcon(icon: MetadataIcon): boolean {
  return !icon.unsupported_families?.includes(OUTLINED_FAMILY);
}

function createIconUrl(host: string, name: string): string {
  return `https://${host}/s/i/short-term/release/${OUTLINED_STYLE_SLUG}/${name}/${DEFAULT_STYLE_SEGMENT}/${DEFAULT_OPSZ}px.xml`;
}

async function downloadIconXml(host: string, name: string): Promise<string> {
  const url = createIconUrl(host, name);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${name}: HTTP ${response.status}\nURL: ${url}`);
  }
  return response.text();
}

async function main() {
  const metadata = await loadMetadata();
  if (!metadata.families.includes(OUTLINED_FAMILY)) {
    throw new Error(`Metadata does not include ${OUTLINED_FAMILY}`);
  }

  await mkdir(ICONS_DIR, { recursive: true });

  const icons = metadata.icons.filter(isOutlinedIcon);
  console.log(`Processing ${icons.length} outlined icons from Google metadata...`);

  for (const icon of icons) {
    const fileName = toFileName(icon.name);
    const xml = await downloadIconXml(metadata.host, icon.name);

    await writeFile(`${ICONS_DIR}/${fileName}.xml`, xml);
    await writeFile(`${ICONS_DIR}/${fileName}.xml.d.ts`, TYPE_FILE);
  }

  console.log(`Generated ${icons.length} icons`);
}

main().catch(console.error);
