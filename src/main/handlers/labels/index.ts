import { ipcMain } from "electron";
import { getAllLabels } from "./get-all-labels";

export default function labelHandlers() {
  ipcMain.handle("labels:get-all", () => getAllLabels());
}
