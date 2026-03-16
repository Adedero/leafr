import FONTS from "@renderer/constants/fonts";
import cache from "@renderer/utils/ttl-cache";
import { useLocalStorage } from "@vueuse/core";
import { computed, watch } from "vue";

export default function useFont() {
  const UIFont = useLocalStorage<string>("app:ui-font", FONTS[0]);
  const readerFont = useLocalStorage<string>("app:reader-font", FONTS[0]);
  const current = computed(() => ({
    ui: UIFont.value,
    reader: readerFont.value
  }));
  const systemFonts = async () =>
    cache.fetch("system-fonts", async () => await window.api.fonts.getSystemFonts());
  const allFonts = async () => [...FONTS, ...(await systemFonts())];

  const apply = (font: string, type: "ui" | "reader") => {
    const fontVariable = `--font-${type}`;
    document.documentElement.style.setProperty(fontVariable, font);
  };

  const set = (font: string, type: "ui" | "reader") => {
    const fontRef = type === "ui" ? UIFont : readerFont;
    fontRef.value = font;
  };

  watch(UIFont, (font) => apply(font, "ui"), { immediate: true });
  watch(readerFont, (font) => apply(font, "reader"), { immediate: true });

  return {
    current,
    defaultFonts: FONTS,
    systemFonts,
    fonts: allFonts,
    set
  };
}
