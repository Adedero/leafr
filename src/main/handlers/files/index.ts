import { BrowserWindow, dialog, ipcMain } from "electron";
import { resolve } from "node:path";

const iconName = resolve(process.cwd(), "assets/epub-icon.png");

export default function fileHandlers() {
  ipcMain.handle(
    "files:open-dialog",
    async (event, options: Electron.OpenDialogOptions = {}) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return null;

      const result = await dialog.showOpenDialog(win, {
        properties: ["openFile", "multiSelections"],
        ...options
      });

      if (result.canceled) return null;
      return result.filePaths;
    }
  );

  ipcMain.on("files:drag-start", (event, filePath) => {
    event.sender.startDrag({
      file: filePath,
      icon: iconName
    });
  });
}
