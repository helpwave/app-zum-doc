// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from 'eslint/config';
import config from '@helpwave/eslint-config';

export default defineConfig([
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
