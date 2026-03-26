const ANDROID_NS = "http://schemas.android.com/apk/res/android";

/** Convert a CSS hex color to Android's #AARRGGBB format. */
function toAndroidColor(color: string): string {
  if (color.length === 4) {
    // #RGB → #FFRRGGBB
    return `#FF${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
  }
  if (color.length === 7) {
    // #RRGGBB → #FFRRGGBB
    return `#FF${color.slice(1)}`.toUpperCase();
  }
  return color.toUpperCase();
}

/**
 * Convert a cleaned-up SVG string to an Android VectorDrawable XML string.
 *
 * Expects SVGs that have already been normalized by @iconify/tools or Iconify's
 * pipeline — simple `<path>` elements with a `0 0 W H` viewBox, no groups,
 * transforms, gradients, or masks.
 */
export function svgToVectorDrawable(svg: string): string {
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) {
    throw new Error("SVG missing viewBox attribute");
  }
  const parts = viewBoxMatch[1]!.split(/\s+/);
  const width = parts[2]!;
  const height = parts[3]!;

  const paths: string[] = [];
  const pathRegex = /<path\s([^>]*?)\/>/g;
  let match;
  while ((match = pathRegex.exec(svg)) !== null) {
    const attrs = match[1]!;

    const dMatch = attrs.match(/\bd="([^"]+)"/);
    if (!dMatch) continue;
    const pathData = dMatch[1]!;

    const fillMatch = attrs.match(/\bfill="([^"]+)"/);
    const fill = fillMatch?.[1];
    const fillColor =
      !fill || fill === "currentColor" ? "#FF000000" : toAndroidColor(fill);

    paths.push(
      `    <path\n        android:fillColor="${fillColor}"\n        android:pathData="${pathData}"/>`,
    );
  }

  if (paths.length === 0) {
    throw new Error("SVG contains no <path> elements");
  }

  return `<vector xmlns:android="${ANDROID_NS}"
    android:width="${width}dp"
    android:height="${height}dp"
    android:viewportWidth="${width}"
    android:viewportHeight="${height}">
${paths.join("\n")}
</vector>\n`;
}
