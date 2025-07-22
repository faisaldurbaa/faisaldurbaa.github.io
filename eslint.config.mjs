// eslint.config.mjs
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    extends: [
      ...eslintPluginAstro.configs['flat/recommended'],
      ...eslintPluginAstro.configs['flat/jsx-a11y-recommended'],
    ],
    files: ['**/*.ts', '**/*.tsx', '**/*.astro'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
  },
  {
    ignores: ['dist/', '.astro/'],
  }
);