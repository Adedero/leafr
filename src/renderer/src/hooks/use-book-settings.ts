export type TBookSettings = {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  wordSpacing: number;
  paragraphSpacing: number;
  flow: "scroll" | "single" | "double" | "auto";
};

const defaultSettings: TBookSettings = {
  fontSize: 16,
  fontFamily: "Geist Mono",
  lineHeight: 1.8,
  wordSpacing: 0,
  paragraphSpacing: 10,
  flow: "auto"
};

const settings = ref<TBookSettings>(defaultSettings);

const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 60;
const MIN_LINE_HEIGHT = 1;
const MAX_LINE_HEIGHT = 5;
const MIN_WORD_SPACING = 0;
const MAX_WORD_SPACING = 20;
const MIN_PARAGRAPH_SPACING = 0;
const MAX_PARAGRAPH_SPACING = 50;
const PAGE_LAYOUTS: Array<TBookSettings["flow"]> = ["scroll", "single", "double", "auto"];

const constraints = {
  fontSize: { min: MIN_FONT_SIZE, max: MAX_FONT_SIZE },
  lineHeight: { min: MIN_LINE_HEIGHT, max: MAX_LINE_HEIGHT },
  wordSpacing: { min: MIN_WORD_SPACING, max: MAX_WORD_SPACING },
  paragraphSpacing: { min: MIN_PARAGRAPH_SPACING, max: MAX_PARAGRAPH_SPACING }
} as const;

export const useBookSettings = () => {
  const STORAGE_KEY = "book:settings";
  const serialize = (value: TBookSettings) => JSON.stringify(value);
  const deserialize = (value: string) => JSON.parse(value) as TBookSettings;

  const increment = (key: keyof typeof constraints, amount: number) => {
    settings.value[key] = Math.min(
      constraints[key].max,
      Numerics.isDecimal(amount)
        ? Numerics.round(
            settings.value[key] + amount,
            Numerics.decimalPoints(amount)
          )
        : settings.value[key] + amount
    );
  };

  const decrement = (key: keyof typeof constraints, amount: number) => {
    settings.value[key] = Math.max(
      constraints[key].min,
      Numerics.isDecimal(amount)
        ? Numerics.round(
            settings.value[key] - amount,
            Numerics.decimalPoints(amount)
          )
        : settings.value[key] - amount
    );
  };

  const reset = () => {
    settings.value = { ...defaultSettings };
  };

  watch(
    settings,
    (newSettings) => {
      localStorage.setItem(STORAGE_KEY, serialize(newSettings));
    },
    { deep: true }
  );

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      settings.value = deserialize(saved);
    }
  });

  return {
    settings,
    reset,
    decrement,
    increment,

    MIN_FONT_SIZE,
    MAX_FONT_SIZE,
    MIN_LINE_HEIGHT,
    MAX_LINE_HEIGHT,
    MIN_WORD_SPACING,
    MAX_WORD_SPACING,
    MIN_PARAGRAPH_SPACING,
    MAX_PARAGRAPH_SPACING,
    PAGE_LAYOUTS
  };
};
