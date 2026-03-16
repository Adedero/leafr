import { shell } from "electron";
import { ipcMain } from "electron/main";

export default function linkHandlers() {
  ipcMain.handle("link:open-external", (_event, url) => {
    shell.openExternal(url);
  });
}
