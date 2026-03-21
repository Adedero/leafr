// import { platform } from "node:os";
import { join } from "node:path";

export const getIcon = () => {
  return join(__dirname, "../../resources/icon.png");
  // console.log(join(__dirname, "../../resources/icon.ico"))
  // switch (platform()) {
  //   case "win32":
  //     return join(__dirname, "../../resources/icon.ico");
  //   case "darwin":
  //     return join(__dirname, "../../resources/icon.icns");
  //   default:
  //     return join(__dirname, "../../resources/icon.png");
  // }
};
