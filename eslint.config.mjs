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
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-empty-object-type": "off",

    "import/order": "error",

    "prettier/prettier": "error",

    "vue/multi-word-component-names": "off",
  },
});
