// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import prettierConfig from "@vue/eslint-config-prettier";

export default withNuxt(prettierConfig, {
  files: ["app/**/*.ts", "app/**/*.vue"],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
  rules: {
    "sort-imports": "error",
    "prettier/prettier": "error",
    "@typescript-eslint/no-floating-promises": "error",

    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-empty-object-type": "off",
  },
});
