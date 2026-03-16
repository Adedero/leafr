import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

const useUIStore = defineStore("ui", () => {
  const navbar = useLocalStorage<Navbar>("navbar:width", { width: "5.5rem" });

  return {
    navbar
  };
});

export default useUIStore;
export interface Navbar {
  width: string;
}
