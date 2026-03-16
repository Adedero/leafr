import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { PROTOCOL_NAME } from "../main/utils/constants";
import { BeforeBookCloseInput } from "../main/handlers/books/before-book-close";

// Custom APIs for renderer
const api = {
  fonts: {
    getSystemFonts: () => ipcRenderer.invoke("system-fonts")
  },
  link: {
    openExternal: (url: string) => ipcRenderer.invoke("link:open-external", url)
  },
  protocolName: PROTOCOL_NAME,
  books: {
    getAll: () => ipcRenderer.invoke("books:get-all"),
    sync: () => ipcRenderer.invoke("books:sync"),
    getFullBook: (bookId: string) => ipcRenderer.invoke("books:get-full-book", bookId),
    beforeBookOpen: (bookId: string) => ipcRenderer.invoke("books:before-book-open", bookId),
    beforeBookClose: (input: BeforeBookCloseInput) => ipcRenderer.invoke("books:before-book-close", input)
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
