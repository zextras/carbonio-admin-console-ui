import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactCompiler from 'eslint-plugin-react-compiler';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import testingLibrary from 'eslint-plugin-testing-library';
import importX from 'eslint-plugin-import-x';
import noticeConfig from './notice.config.js';

import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';

function toSeverity(rules, severity) {
  return Object.fromEntries(Object.keys(rules).map((rule) => [rule, severity]));
}

export default defineConfig(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  globalIgnores([
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
  ]),
  // default strict config
  {
    plugins: {
      'react-compiler': reactCompiler,
      'jsx-a11y': jsxA11y,
      'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffect,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      'import-x': importX,
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-console': ['error', { allow: ['error'] }],
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import-x/no-duplicates': 'error',
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
  // testing-library rules on unit tests, warn until existing findings are addressed
  {
    files: ['**/*.test.*', '**/tests/**'],
    plugins: { 'testing-library': testingLibrary },
    rules: toSeverity(testingLibrary.configs['flat/react'].rules, 'warn'),
  },
  // browser tests use the vitest/browser page API instead of testing-library
  {
    files: ['**/*.browser.test.*'],
    rules: toSeverity(testingLibrary.configs['flat/react'].rules, 'off'),
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
      'react/prop-types': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      ...toSeverity(reactYouMightNotNeedAnEffect.configs.strict.rules, 'warn'),
      ...toSeverity(jsxA11y.configs.recommended.rules, 'warn'),
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/static-components': 'warn',
      'react-compiler/react-compiler': 'warn',
    },
  },
);
