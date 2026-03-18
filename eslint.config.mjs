import { defineConfig } from "eslint/config";
import tseslint from "@electron-toolkit/eslint-config-ts";
import eslintPluginVue from "eslint-plugin-vue"; // 1. Uncomment this
import vueParser from "vue-eslint-parser";

export default defineConfig(
  { ignores: ["**/node_modules", "**/dist", "**/out"] },

  ...tseslint.configs.recommended,

  ...eslintPluginVue.configs["flat/recommended"],

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        extraFileExtensions: [".vue"],
        // This ensures TS is parsed correctly inside <script> tags
        parser: "@typescript-eslint/parser"
      }
    }
  },
  {
    // 3. Ensure this object knows about the 'vue' plugin
    files: ["**/*.{ts,mts,tsx,vue}"],
    plugins: {
      vue: eslintPluginVue
    },
    rules: {
      "vue/require-default-prop": "off",
      "vue/multi-word-component-names": "off",
      "vue/max-attributes-per-line": "off",
      "vue/html-self-closing": "off",
      "vue/block-lang": [
        "error",
        {
          script: {
            lang: "ts"
          }
        }
      ]
    }
  },
  {
    rules: {
      "no-undef": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports"
        }
      ]
    }
  }
);
