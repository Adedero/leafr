import { BeforeBookCloseInput } from "src/main/handlers/books/before-book-close";
import { useRouter } from "vue-router";
import useToast from "./use-toast";

export default function useBook() {
  const router = useRouter();
  const toast = useToast();

  const open = async (bookId: string) => {
    const res = await window.api.books.beforeBookOpen(bookId);
    if (!res) {
      toast.error("Error", "Failed to open book. Please, try again later.");
      return;
    }
    router.push(`/books/${bookId}`);
  };

  const onBeforeClose = async (input: BeforeBookCloseInput) => {
    const res = await window.api.books.beforeBookClose(input);
    return res;
  };

  const getBook = async (bookId: string) => {
    const book = await window.api.books.getFullBook(bookId);
    return book;
  };

  return {
    open,
    onBeforeClose,
    getBook
  };
}
