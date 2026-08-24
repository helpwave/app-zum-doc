// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const config = require('@helpwave/eslint-config');

module.exports = defineConfig([
  config.recommended,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      indent: ['warn', 2],
    },
  },
]);
