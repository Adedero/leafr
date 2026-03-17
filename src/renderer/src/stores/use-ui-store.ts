import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

const useUIStore = defineStore("ui", () => {
  const navbarWidth = useLocalStorage<string>("navbar:width", "5.5rem");
  const bookFooterLocked = useLocalStorage<boolean>("book-footer:locked", false);
  const toggleBookFooterLocked = () => {
    bookFooterLocked.value = !bookFooterLocked.value;
  };

  return {
    navbarWidth,
    bookFooterLocked,
    toggleBookFooterLocked
  };
});

export default useUIStore;
