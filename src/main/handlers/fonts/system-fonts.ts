import getSystemFonts from "get-system-fonts";

export default async function systemFonts() {
  const fonts = await getSystemFonts();
  return fonts;
}
