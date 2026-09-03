import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactCompiler from 'eslint-plugin-react-compiler';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import noticeConfig from './notice.config.js';
import typescriptParser from '@typescript-eslint/parser';

import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function toWarnings(rules) {
  return Object.fromEntries(Object.keys(rules).map((rule) => [rule, 'warn']));
}

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-types/**',
      '**/build/**',
      '**/coverage/**',
      'package/**',
      '**/*vitest*',
      '**/*.config.*',
      '**/.prettierrc.js',
      '**/.reuse/template.js',
      '**/fileTransformer.js',
    ],
  },
  // default strict config
  {
    plugins: {
      'react-compiler': reactCompiler,
      'jsx-a11y': jsxA11y,
      'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffect,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-console': ['error', { allow: ['error'] }],
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-duplicate-imports': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      ...jsxA11y.configs.recommended.rules,
      ...reactYouMightNotNeedAnEffect.configs.strict.rules,
    },
  },
  noticeConfig,
  {
    files: ['**/icons/**/*.[jt]sx'],
    rules: {
      'notice/notice': 'off',
    },
  },
  // weak eslint config for packages, to be tightened incrementally
  {
    files: ['packages/**'],
    rules: {
      'no-console': ['error', { allow: ['error', 'warn'] }],
      'no-duplicate-imports': 'warn',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      ...toWarnings(reactYouMightNotNeedAnEffect.configs.strict.rules),
      ...toWarnings(jsxA11y.configs.recommended.rules),
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-compiler/react-compiler': 'warn',
    },
  },
);
