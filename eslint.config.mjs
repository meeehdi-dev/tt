// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import prettierConfig from "@vue/eslint-config-prettier";

export default withNuxt(prettierConfig, {
  rules: {
    "prettier/prettier": "error",
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-empty-object-type": "off",
  },
});
