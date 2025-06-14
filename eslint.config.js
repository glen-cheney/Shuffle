import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintJs from '@eslint/js';
import configPrettier from 'eslint-config-prettier/flat';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginImport from 'eslint-plugin-import';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';

export default defineConfig([
  eslintJs.configs.recommended,
  pluginImport.flatConfigs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs['recommended-latest'],
  pluginJsxA11y.flatConfigs.recommended,
  {
    plugins: {
      react: pluginReact,
    },

    settings: {
      react: {
        version: '19',
      },
      'import/extensions': ['.js', '.jsx'],
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
      },
    },

    languageOptions: {
      globals: globals.browser,
    },

    rules: {
      // We like _private methods and variables. It's easier to refactor code
      // when you know other components shouldn't be using private methods + props.
      'no-underscore-dangle': 'off',

      // Allow + and - in the same line.
      'no-mixed-operators': 'off',

      // Shadowing is a nice language feature. Naming is hard.
      'no-shadow': 'off',

      // Make inheritance annoying sometimes.
      'class-methods-use-this': 'off',

      // Allow `i++` in loops.
      'no-plusplus': [
        'error',
        {
          allowForLoopAfterthoughts: true,
        },
      ],

      // Allow reassigning properties of objects.
      'no-param-reassign': [
        'error',
        {
          props: false,
        },
      ],

      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'warn',
    },
  },
  {
    files: ['apps/website/**'],
    rules: {
      'import/no-unresolved': [
        'error',
        {
          ignore: ['^@theme', '^@docusaurus'],
        },
      ],
    },
  },
  configPrettier,
  globalIgnores(['**/dist', '**/js', '**/test', '**/_site', '**/vitest.config.ts', '**/docusaurus.config.ts']),
]);
