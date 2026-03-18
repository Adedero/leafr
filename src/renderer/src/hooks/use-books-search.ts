const text = ref("");

export function useBooksSearch() {
  const debounced = refDebounced(text, 500);
  return {
    text,
    debounced
  };
}
