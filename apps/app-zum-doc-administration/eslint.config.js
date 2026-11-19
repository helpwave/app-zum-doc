import config from '@helpwave/eslint-config'

export default [
  {
    ignores: [
      'i18n/*',
      'next-env.d.ts',
      '.next/*',
      'scripts/*',
      'out/*',
    ],
  },
  {
    rules: {
      indent: ['warn', 2],
    },
  },
  ...config.nextExtension,
]
