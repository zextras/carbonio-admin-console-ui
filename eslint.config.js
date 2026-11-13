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
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';

import noticeConfig from './notice.config.js';

function toSeverity(rules, severity) {
  return Object.fromEntries(Object.keys(rules).map((rule) => [rule, severity]));
}

export default defineConfig(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // global ignores
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

  // default strict config: applies to all files
  {
    plugins: {
      'react-compiler': reactCompiler,
      'jsx-a11y': jsxA11y,
      'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffect,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      'import-x': importX,
    },
    linterOptions: { reportUnusedDisableDirectives: 'error', reportUnusedInlineConfigs: 'error' },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-console': ['error', { allow: ['error'] }],
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import-x/no-duplicates': 'error',
      'react-compiler/react-compiler': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useMemo', 'useCallback', 'memo'],
              message:
                'React Compiler memoizes automatically — see AGENTS.md "React Compiler". Use plain values/functions.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='useMemo']",
          message: 'React Compiler memoizes automatically — use a plain value. See AGENTS.md.',
        },
        {
          selector: "CallExpression[callee.name='useCallback']",
          message: 'React Compiler memoizes automatically — use a plain function. See AGENTS.md.',
        },
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.property.name='useMemo']",
          message: 'React Compiler memoizes automatically — use a plain value. See AGENTS.md.',
        },
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.property.name='useCallback']",
          message: 'React Compiler memoizes automatically — use a plain function. See AGENTS.md.',
        },
      ],
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

  // test overrides
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

  // license headers (notice plugin), with icon files exempt
  noticeConfig,
  {
    files: ['**/icons/**/*.[jt]sx'],
    rules: {
      'notice/notice': 'off',
    },
  },

  // ui-shared: only logging and minor type-lint downgrades
  {
    files: ['packages/ui-shared/**'],
    rules: {
      'no-console': ['error', { allow: ['error', 'warn'] }],
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
    },
  },
);
