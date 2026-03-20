import { BrowserWindow } from "electron";

export default function emit<T extends keyof Emits>(
  channel: T,
  payload: Emits[T]
) {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send(channel, payload);
  }
}

export type Emits = {
  "file:add": null;
  "file:change": null;
  "file:unlink": null;
  "lib-dir:add": null;
  "lib-dir:unlink": null;
};
