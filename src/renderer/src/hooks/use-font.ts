import FONTS from "@renderer/constants/fonts";

export function useFont() {
  const { settings } = useBookSettings();

  const UIFont = useLocalStorage<string>("app:ui-font", FONTS[0]);
  const current = computed(() => ({
    ui: UIFont.value,
    reader: settings.value.fontFamily
  }));
  const systemFonts = async () =>
    cache.fetch(
      "system-fonts",
      async () => await window.api.fonts.getSystemFonts()
    );
  const allFonts = async () => {
    const sf = await systemFonts();
    return [...FONTS, ...sf];
  };

  const apply = (font: string, type: "ui" | "reader") => {
    if (type === "ui") {
      const fontVariable = `--font-${type}`;
      document.documentElement.style.setProperty(fontVariable, font);
      return;
    }
    settings.value.fontFamily = font;
  };

  const set = (font: string, type: "ui" | "reader") => {
    if (type === "ui") {
      UIFont.value = font;
      return;
    }
    settings.value.fontFamily = font;
  };

  watch(UIFont, (font) => apply(font, "ui"), { immediate: true });

  return {
    current,
    defaultFonts: FONTS,
    systemFonts,
    getFonts: allFonts,
    set
  };
}
