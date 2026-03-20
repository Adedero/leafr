import type { ElectronAPI } from "@electron-toolkit/preload";
import type { FullBook } from "../main/database/schema";
import type { SyncBooksReturn } from "../main/handlers/books/sync-books";
import type { BeforeBookCloseInput } from "../main/handlers/books/before-book-close";
import type { GetAllBooksReturn } from "src/main/handlers/books/get-all-books";
import type { SaveBookLocationsInput } from "src/main/handlers/books/save-book-locations";
import type { Emits } from "../main/utils/emit";
import type { GetAllLabelsResponse } from "src/main/handlers/labels/get-all-labels";
import type { UpdateReadingProgressInput } from "src/main/handlers/books/update-reading-progress";

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
        updateReadingProgress: (
          input: UpdateReadingProgressInput
        ) => Promise<boolean>;
        saveOpenedFiles: (filePaths: string[]) => Promise<string[]>;
      };
      labels: {
        getAllLabels: () => Promise<GetAllLabelsResponse>;
      };
      files: {
        openDialog: (
          options?: Electron.OpenDialogOptions
        ) => Promise<string[] | null>;
        startDrag: (fileName: string) => void;
        getFilePath: (file: File) => Promise<string>;
      };
      on: <T extends keyof Emits>(
        channel: T,
        fn: (payload: Emits[T]) => void
      ) => void;
      off: <T extends keyof Emits>(
        channel: T,
        fn: (...args: unknown[]) => void
      ) => void;
    };
  }
}
