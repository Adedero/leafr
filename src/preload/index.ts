import {
  contextBridge,
  ipcRenderer,
  webUtils,
  type IpcRendererEvent
} from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { PROTOCOL_NAME } from "../main/utils/constants";
import type { BeforeBookCloseInput } from "../main/handlers/books/before-book-close";
import type { SaveBookLocationsInput } from "../main/handlers/books/save-book-locations";
import type { Emits } from "../main/utils/emit";
import type { UpdateReadingProgressInput } from "../main/handlers/books/update-reading-progress";

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
    getFullBook: (bookId: string) =>
      ipcRenderer.invoke("books:get-full-book", bookId),
    saveOpenedFiles: (paths: string[]) =>
      ipcRenderer.invoke("books:save-opened-files", paths),
    beforeBookOpen: (bookId: string) =>
      ipcRenderer.invoke("books:before-book-open", bookId),
    beforeBookClose: (input: BeforeBookCloseInput) =>
      ipcRenderer.invoke("books:before-book-close", input),
    saveBookLocation: (input: SaveBookLocationsInput) =>
      ipcRenderer.invoke("books:save-book-locations", input),
    updateReadingProgress: (input: UpdateReadingProgressInput) =>
      ipcRenderer.invoke("books:update-reading-progress", input)
  },
  labels: {
    getAllLabels: () => ipcRenderer.invoke("labels:get-all")
  },
  files: {
    openDialog: (options?: Electron.OpenDialogOptions) =>
      ipcRenderer.invoke("files:open-dialog", options),
    startDrag: (fileName: string) =>
      ipcRenderer.send("files:drag-start", fileName),
    getFilePath: (file: File) => webUtils.getPathForFile(file)
  },
  on: <T extends keyof Emits>(channel: T, fn: (payload: Emits[T]) => void) => {
    const wrapper = (_event: IpcRendererEvent, payload: Emits[T]) =>
      fn(payload);
    ipcRenderer.on(channel, wrapper);
    return wrapper; // return so it can be removed
  },
  off: <T extends keyof Emits>(
    channel: T,
    fn: (...args: unknown[]) => void
  ) => {
    ipcRenderer.removeListener(channel, fn);
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
