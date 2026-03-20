const JSON_URL =
  "https://raw.githubusercontent.com/iconify/icon-sets/master/json/material-symbols.json";
const OUTPUT_PATH = "./material-symbols.json";

console.log("Downloading material-symbols.json...");
const response = await fetch(JSON_URL);
if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
await Bun.write(OUTPUT_PATH, response);
console.log(`Saved to ${OUTPUT_PATH}`);
