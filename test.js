import { initEpubFile } from "@lingo-reader/epub-parser";

async function main() {
  const file = "C:/Users/adedero/Downloads/Good Young Men - Gary Lonesborough.epub";
  const file2 = "C:/Users/adedero/Downloads/Gay_Love_-_Elizabeth_Coldwell.epub";
  const file3 = "C:/Users/adedero/Downloads/_OceanofPDF.com_Gay_Club_-_Simon_James_Green.epub";
  const epub = await initEpubFile(file3);

  console.log("Cover Image", epub.getCoverImage());

  epub.destroy();
}

main();
