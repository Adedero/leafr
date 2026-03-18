import type { ElectronAPI } from "@electron-toolkit/preload";
import type { Book, FullBook } from "../main/database/schema";
import type { SyncBooksReturn } from "../main/handlers/books/sync-books";
import type { BeforeBookCloseInput } from "../main/handlers/books/before-book-close";
import type { GetAllBooksReturn } from "src/main/handlers/books/get-all-books";
import type { SaveBookLocationsInput } from "src/main/handlers/books/save-book-locations";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      fonts: {
        getSystemFonts: () => Promise<string[]>;
      };
      link: {
        openExternal: (url: string) => void;
      };
      protocolName: string;
      books: {
        getAll: () => Promise<GetAllBooksReturn>;
        sync: () => Promise<SyncBooksReturn>;
        getFullBook: (bookId: string) => Promise<FullBook>;
        beforeBookOpen: (bookId: string) => Promise<boolean>;
        beforeBookClose: (input: BeforeBookCloseInput) => Promise<boolean>;
        saveBookLocation: (input: SaveBookLocationsInput) => Promise<boolean>;
      };
    };
  }
}
