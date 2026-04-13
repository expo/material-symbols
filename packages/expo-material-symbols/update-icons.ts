const METADATA_URL =
  "https://fonts.google.com/metadata/icons?incomplete=1&key=material_symbols";
const OUTPUT_PATH = "./material-symbols-metadata.json";

function stripMetadataPrefix(raw: string): string {
  return raw.startsWith(")]}'") ? raw.slice(4) : raw;
}

console.log("Downloading Material Symbols metadata from Google...");
const response = await fetch(METADATA_URL);
if (!response.ok) throw new Error(`Failed to fetch metadata: ${response.status}`);

const metadata = JSON.parse(stripMetadataPrefix(await response.text()));
await Bun.write(OUTPUT_PATH, JSON.stringify(metadata, null, 2));
console.log(`Saved metadata to ${OUTPUT_PATH}`);
