import { resolve } from "path";
import { defineConfig } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [
      tailwindcss(),
      Icons({ autoInstall: true, compiler: "vue3" }),
      AutoImport({
        imports: [
          "vue",
          "vue-router",
          "pinia",
          "@vueuse/core",
          {
            "@renderer/utils/asset-url": [["default", "assetURL"]],
            "@renderer/utils/char": [["default", "Char"]],
            "@renderer/utils/list": [["default", "List"]],
            "@renderer/utils/numerics": [["default", "Numerics"]],
            "@renderer/utils/ttl-cache": [["default", "cache"]]
          }
        ],
        dts: "auto-imports.d.ts",
        dirs: ["src/hooks", "src/utils/**"]
      }),
      Components({
        dirs: ["src/components"],
        deep: true,
        dts: "components.d.ts",
        extensions: ["vue"],
        resolvers: [IconsResolver({ enabledCollections: ["lucide"] })]
      }),
      vue()
    ]
  }
});
