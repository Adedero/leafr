export const useUiStore = defineStore("ui", () => {
  const navbarWidth = useLocalStorage<string>("navbar:width", "5.5rem");
  const bookFooterLocked = useLocalStorage<boolean>(
    "book-footer:locked",
    false
  );
  const bookSliderOpen = useLocalStorage<boolean>("book-slider:open", false);
  const toggleBookFooterLocked = () => {
    bookFooterLocked.value = !bookFooterLocked.value;
  };

  const homePageBooksSort = useLocalStorage<string>(
    "home-page:books-sort",
    "name:asc"
  );

  return {
    navbarWidth,
    bookFooterLocked,
    bookSliderOpen,
    toggleBookFooterLocked,
    homePageBooksSort
  };
});
