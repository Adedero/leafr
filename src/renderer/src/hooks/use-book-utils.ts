import type { BeforeBookCloseInput } from "src/main/handlers/books/before-book-close";
import type { SaveBookLocationsInput } from "src/main/handlers/books/save-book-locations";
import type { UpdateReadingProgressInput } from "src/main/handlers/books/update-reading-progress";

export type UseBookUtils = ReturnType<typeof useBookUtils>;

export const useBookUtils = () => {
  const router = useRouter();
  const toast = useToast();

  const beforeBookOpen = async (bookId: string) => {
    const res = await window.api.books.beforeBookOpen(bookId);
    return res;
  };

  const openAndNavigate = async (
    bookId: string,
    {
      dest,
      showToastOnError = true,
      throwOnError = false
    }: OpenAndNavigateOptions = {}
  ): Promise<void> => {
    try {
      const res = await beforeBookOpen(bookId);
      if (!res) {
        throw new Error("Failed to open book. Please, try again later.");
      }
      router.push(dest ?? `/books/${bookId}`);
    } catch (e) {
      if (showToastOnError) {
        toast.error("Error", (e as Error).message);
      }
      if (throwOnError) {
        throw e;
      }
    }
  };

  const beforeBookClose = async (input: BeforeBookCloseInput) => {
    const res = await window.api.books.beforeBookClose(input);
    return res;
  };

  const getBook = async (bookId: string) => {
    const book = await window.api.books.getFullBook(bookId);
    return book;
  };

  const getAllBooks = async () => {
    const books = await window.api.books.getAll();
    return books;
  };

  const saveBookLocations = async (input: SaveBookLocationsInput) => {
    const res = await window.api.books.saveBookLocation(input);
    return res;
  };

  const updateReadingProgress = async (input: UpdateReadingProgressInput) => {
    const res = await window.api.books.updateReadingProgress(input);
    return res;
  };

  const syncBooks = async () => {
    return await window.api.books.sync();
  };

  return {
    beforeBookOpen,
    beforeBookClose,
    getAllBooks,
    getBook,
    openAndNavigate,
    saveBookLocations,
    syncBooks,
    updateReadingProgress
  };
};

export interface OpenAndNavigateOptions {
  dest?: string;
  showToastOnError?: boolean;
  throwOnError?: boolean;
}
