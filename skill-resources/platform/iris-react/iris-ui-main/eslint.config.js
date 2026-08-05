// @ts-check
import eslint from '@eslint/js';
import header from '@tony.ganchev/eslint-plugin-header';
import angular from 'angular-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import storybook from 'eslint-plugin-storybook';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist/**']
  },
  ...defineConfig(
    {
      files: ['**/*.ts'],
      extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
        ...tseslint.configs.stylistic,
        ...angular.configs.tsRecommended,
        prettierConfig,
      ],
      plugins: {
        prettier: prettierPlugin,
        header
      },
      processor: angular.processInlineTemplates,
      rules: {
        'prettier/prettier': 'error',
        'header/header': [
          'error',
          'line',
          {
            pattern: ' Copyright © 20\\d{2} One Identity LLC. ALL RIGHTS RESERVED.',
            template: ' Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.'
          }
        ],
        'no-restricted-imports': [
          'error',
          {
            patterns: ['Components/*', 'Storybook/*', '../*', './../*', '../../*'],
            paths: [
              { name: 'Components/*', message: 'Use @iris-ui/* alias instead.' },
              { name: 'Storybook/*', message: 'Use @storybook/* alias instead.' },
              { name: '../*', message: 'Use absolute path with @<module>/* alias instead.' },
              { name: './../*', message: 'Use absolute path with @<module>/* alias instead.' },
              { name: '../../*', message: 'Use absolute path with @<module>/* alias instead.' }
            ]
          }
        ],
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'iris',
            style: 'camelCase',
          },
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'iris',
            style: 'kebab-case',
          },
        ],
        'curly': 'warn',
        'no-alert': 'error',
        'no-lone-blocks': 'error',
        'no-lonely-if': 'error',
        'no-multi-assign': 'error',
        'no-nested-ternary': 'error',
        'no-implicit-coercion': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
          }
        ],
      },
    },
    {
      files: ['**/*.html'],
      extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
      rules: {},
    },
  ),
  ...storybook.configs['flat/recommended'],
  {
    files: ['Storybook/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'story',
          style: 'kebab-case',
        },
      ]
    }
  },
  {
    files: ['Components/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/public-api'],
              message: 'Internal files must NOT import from public-api. Use direct path or @iris-ui/* alias.'
            }
          ]
        }
      ]
    }
  }
];
