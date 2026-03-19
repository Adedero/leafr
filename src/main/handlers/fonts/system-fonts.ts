import getSystemFonts from "get-system-fonts";
import path from "node:path";

const STYLE_WORDS = [
  "regular",
  "bold",
  "italic",
  "light",
  "medium",
  "thin",
  "black",
  "heavy",
  "semibold",
  "extrabold",
  "extralight",
  "condensed",
  "narrow",
  "oblique",
  "bolditalic"
];

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function systemFonts(): Promise<string[]> {
  const fonts = await getSystemFonts();

  const names = fonts.map((fontPath) => {
    const filename = path.basename(fontPath, path.extname(fontPath));

    // 1. Normalize separators → space
    const name = filename.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

    // 2. Iteratively remove style suffixes from the end
    const parts = name.split(" ");

    while (parts.length) {
      const last = parts[parts.length - 1].toLowerCase();

      if (STYLE_WORDS.includes(last)) {
        parts.pop();
        continue;
      }

      // handle concatenated styles like "BoldItalic"
      const matched = STYLE_WORDS.find((w) => last.endsWith(w));

      if (matched && last !== matched) {
        parts[parts.length - 1] = last.slice(0, -matched.length);
        if (!parts[parts.length - 1]) parts.pop();
        continue;
      }

      break;
    }

    return toTitleCase(parts.join(" ").trim());
  });

  return [...new Set(names)].sort();
}
