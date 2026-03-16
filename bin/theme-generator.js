import { join } from "node:path";
import themes from "../themes.js";
import { writeFileSync } from "node:fs";

const CSS_PATH = join(process.cwd(), "src/renderer/src/assets/styles/theme.css");
const THEMES_PATH = join(process.cwd(), "src/renderer/src/constants/themes.ts");
const COLOR_KEYS = ["background", "text", "accent", "secondary", "surface", "muted", "border"];

function generateThemeFile() {
  const content = `const THEMES = ${JSON.stringify(themes)};export default THEMES;export type Theme = (typeof THEMES)[number];`;
  writeFileSync(THEMES_PATH, content, { encoding: "utf-8" });
  console.log(`Theme file generated: ${THEMES_PATH}`);
  return;
}

function generateThemeCSS() {
  const lines = [];

  let defaultTheme = themes.find((t) => t.primary);
  if (!defaultTheme) {
    defaultTheme = themes[0];
    defaultTheme.primary = true;
  }

  // ─── @theme block ───────────────────────────────────────────────────────────
  lines.push("@theme {");
  lines.push(`  /* Default: ${defaultTheme.displayName} */`);

  // Default (primary) theme variables
  for (const key of COLOR_KEYS) {
    lines.push(`  --color-${key}: ${defaultTheme.colors[key]};`);
  }

  lines.push("");
  lines.push("  /* All theme tokens */");

  // All themes (including default, for completeness)
  for (const theme of themes) {
    for (const key of COLOR_KEYS) {
      lines.push(`  --color-${theme.name}-${key}: ${theme.colors[key]};`);
    }
  }

  lines.push("}");
  lines.push("");

  // ─── [data-theme="..."] blocks ──────────────────────────────────────────────
  for (const theme of themes) {
    // Skip the primary — it's already the default
    if (theme.primary) continue;

    lines.push(
      `/* ─── ${theme.displayName.toUpperCase()} ${"─".repeat(Math.max(0, 42 - theme.displayName.length))} */`
    );
    lines.push(`[data-theme="${theme.name}"] {`);

    for (const key of COLOR_KEYS) {
      lines.push(`  --color-${key}: var(--color-${theme.name}-${key});`);
    }

    lines.push("}");
    lines.push("");
  }

  for (const theme of themes) {
    if (theme.primary) {
      continue;
    }
    lines.push(
      `@custom-variant ${theme.name} (&:where([data-theme=${theme.name}], [data-theme=${theme.name}] *));`
    );
  }
  lines.push('@custom-variant any-dark (&:where([data-theme^="dark"], [data-theme^="dark"] *));');

  //const content = lines.join("\n");
  const content = lines.join("");

  writeFileSync(CSS_PATH, content, { encoding: "utf-8" });
  console.log(`Theme CSS generated: ${CSS_PATH}`);
  return;
}

(function () {
  generateThemeFile();
  generateThemeCSS();
  console.log("✅ Theme generation complete.");
})();
