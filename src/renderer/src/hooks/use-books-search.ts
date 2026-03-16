import { refDebounced } from "@vueuse/core";
import { ref } from "vue";

const text = ref("");

export default function useBooksSearch() {
  const debounced = refDebounced(text, 500);
  return {
    text,
    debounced
  };
}
