import { watch } from "vue";
import type { Theme } from "@renderer/constants/themes";
import THEMES from "@renderer/constants/themes";
import { useLocalStorage } from "@vueuse/core";

type ThemeName = Theme["name"];

export default function useTheme() {
  const theme = useLocalStorage<ThemeName>("app:theme", THEMES[0].name);

  const apply = (name: ThemeName) => {
    document.documentElement.dataset.theme = name;
  };

  const getCurrentTheme = () => THEMES.find((t) => t.name === theme.value);

  const current = {
    value: () => getCurrentTheme()?.name ?? null,
    isLight: () => getCurrentTheme()?.type === "light",
    isDark: () => getCurrentTheme()?.type === "dark"
  };

  const lightThemes = THEMES.filter((t) => t.type === "light");
  const darkThemes = THEMES.filter((t) => t.type === "dark");

  const set = (name: ThemeName) => {
    theme.value = name;
    apply(name);
  };

  const cycle = List.loop(THEMES.map((t) => t.name));

  const next = () => {
    const nextTheme = cycle();
    if (!nextTheme) {
      return;
    }
    set(nextTheme);
  };

  watch(theme, apply, { immediate: true });

  return {
    current,
    set,
    next,
    theme,
    themes: THEMES,
    lightThemes,
    darkThemes
  };
}
