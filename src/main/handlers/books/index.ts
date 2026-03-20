import { ipcMain } from "electron";
import getAllBooks from "./get-all-books";
import getFullBookData from "./get-full-book-data";
import syncBooks from "./sync-books";
import beforeBookOpen from "./before-book-open";
import type { BeforeBookCloseInput } from "./before-book-close";
import beforeBookClose from "./before-book-close";
import type { SaveBookLocationsInput } from "./save-book-locations";
import saveBookLocations from "./save-book-locations";
import type { UpdateReadingProgressInput } from "./update-reading-progress";
import updateReadingProgress from "./update-reading-progress";
import saveOpenedFiles from "./save-opened-files";

export default function bookHandlers() {
  ipcMain.handle("books:get-all", getAllBooks);
  ipcMain.handle("books:sync", () => syncBooks());
  ipcMain.handle("books:get-full-book", (_, bookId: string) =>
    getFullBookData(bookId)
  );
  ipcMain.handle("books:save-opened-files", (_, paths: string[]) =>
    saveOpenedFiles(paths)
  );
  ipcMain.handle("books:before-book-open", (_, bookId: string) =>
    beforeBookOpen(bookId)
  );
  ipcMain.handle("books:before-book-close", (_, input: BeforeBookCloseInput) =>
    beforeBookClose(input)
  );
  ipcMain.handle(
    "books:save-book-locations",
    (_, input: SaveBookLocationsInput) => saveBookLocations(input)
  );
  ipcMain.handle(
    "books:update-reading-progress",
    (_, input: UpdateReadingProgressInput) => updateReadingProgress(input)
  );
}
