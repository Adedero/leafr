import { ipcMain } from "electron";
import systemFonts from "./system-fonts";

export default function fontHandlers() {
  ipcMain.handle("system-fonts", systemFonts);
}
