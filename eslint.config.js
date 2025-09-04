import globals from "globals";
import tseslint from "typescript-eslint";
import pluginAstro from "eslint-plugin-astro";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import astroParser from "astro-eslint-parser";

export default [
  {
    ignores: ["dist/", ".astro/"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ...tseslint.configs.recommended,
  ...pluginAstro.configs.recommended,
  {
    plugins: {
      'jsx-a11y': eslintPluginJsxA11y,
    },
    rules: {
      ...eslintPluginJsxA11y.configs.recommended.rules,
    }
  },
  {
    // Handle TypeScript files
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Add any custom rules here if needed
    },
  },
  {
    // Handle Astro files
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      "jsx-a11y/label-has-associated-control": "off",
    },
  },
  {
    // Allow require in tailwind config
    files: ["tailwind.config.mjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  }
];
