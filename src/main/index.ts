import { app, shell, BrowserWindow, ipcMain, protocol, net } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import fontHandlers from "./handlers/fonts";
import startup from "./startup";
import linkHandlers from "./handlers/links";
import { PROTOCOL_NAME } from "./utils/constants";
import bookHandlers from "./handlers/books";
import { pathToFileURL } from "node:url";
import labelHandlers from "./handlers/labels";
import fileHandlers from "./handlers/files";
import { getIcon } from "./utils/get-icon";

let mainWindow: BrowserWindow | null = null;

let lastOpenedFile: string | null = null;

const getArgvFile = () => {
  const args = process.argv.slice(app.isPackaged ? 1 : 2);
  return args.find((arg) => arg.endsWith(".epub")) ?? null;
};

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    },
    icon: getIcon()
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"), {
      hash: "home"
    });
  }

  mainWindow.webContents.openDevTools();
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: PROTOCOL_NAME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      bypassCSP: true
    }
  }
]);

fontHandlers();
linkHandlers();
bookHandlers();
labelHandlers();
fileHandlers();

app.whenReady().then(async () => {
  protocol.handle(PROTOCOL_NAME, (request) => {
    let path = request.url.replace(`${PROTOCOL_NAME}://`, "");
    path = decodeURIComponent(path);

    if (/^[a-z]\//i.test(path)) {
      path = path[0].toUpperCase() + ":" + path.slice(1);
    }

    const fileUrl = pathToFileURL(path).toString();
    return net.fetch(fileUrl);
  });

  await startup();

  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle("get-pending-file", () => {
    const file = lastOpenedFile;
    lastOpenedFile = null;
    return file;
  });

  createWindow();

  const argvFile = getArgvFile();
  if (argvFile) {
    lastOpenedFile = argvFile;
    openFileInRenderer(argvFile);
  }

  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
  } else {
    app.on("second-instance", (_event, argv) => {
      const file = argv
        .slice(app.isPackaged ? 1 : 2)
        .find((a) => a.endsWith(".epub"));

      if (file) {
        lastOpenedFile = file;
        openFileInRenderer(file);
      }

      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("open-file", (event, path) => {
  event.preventDefault();

  lastOpenedFile = path;

  if (mainWindow && !mainWindow.isDestroyed()) {
    openFileInRenderer(path);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("app-quit");
  }
});

function openFileInRenderer(path: string) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const send = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("open-file", path);
    }
  };

  if (mainWindow.webContents.isLoading()) {
    mainWindow.webContents.once("did-finish-load", send);
  } else {
    send();
  }
}
