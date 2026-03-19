const text = ref("");
const isClicked = ref<boolean>(false);

export function useBooksSearch() {
  const debounced = refDebounced(text, 500);
  return {
    text,
    debounced,
    isClicked
  };
}
