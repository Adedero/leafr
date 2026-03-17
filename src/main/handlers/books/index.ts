import { ipcMain } from "electron";
import getAllBooks from "./get-all-books";
import getFullBookData from "./get-full-book-data";
import syncBooks from "./sync-books";
import beforeBookOpen from "./before-book-open";
import beforeBookClose, { BeforeBookCloseInput } from "./before-book-close";
import saveBookLocations, { SaveBookLocationsInput } from "./save-book-locations";

export default function bookHandlers() {
  ipcMain.handle("books:get-all", getAllBooks);
  ipcMain.handle("books:sync", syncBooks);
  ipcMain.handle("books:get-full-book", (_, bookId: string) => getFullBookData(bookId));
  ipcMain.handle("books:before-book-open", (_, bookId: string) => beforeBookOpen(bookId));
  ipcMain.handle("books:before-book-close", (_, input: BeforeBookCloseInput) => beforeBookClose(input));
  ipcMain.handle("books:save-book-locations", (_, input: SaveBookLocationsInput) => saveBookLocations(input));
}
