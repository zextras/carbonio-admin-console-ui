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

// new input family (created 2026-09/10): held to the full strict rule set
const NEW_INPUT_FAMILY_STRICT = [
  'packages/ui-components/src/components/inputs/commons/**',
  'packages/ui-components/src/components/inputs/input-shell.tsx',
  'packages/ui-components/src/components/inputs/text-input.tsx',
  'packages/ui-components/src/components/inputs/number-input.tsx',
  'packages/ui-components/src/components/inputs/password-input.tsx',
  'packages/ui-components/src/components/inputs/plain-textarea.tsx',
  'packages/ui-components/src/components/inputs/select.tsx',
  'packages/ui-components/src/components/inputs/combobox-input.tsx',
  'packages/ui-components/src/components/inputs/labeled-value.tsx',
  'packages/ui-components/src/components/inputs/tests/text-input.browser.test.tsx',
  'packages/ui-components/src/components/inputs/tests/number-input.browser.test.tsx',
  'packages/ui-components/src/components/inputs/tests/number-input.test.ts',
  'packages/ui-components/src/components/inputs/tests/password-input.browser.test.tsx',
  'packages/ui-components/src/components/inputs/tests/plain-textarea.browser.test.tsx',
  'packages/ui-components/src/components/inputs/tests/select.browser.test.tsx',
  'packages/ui-components/src/components/inputs/tests/combobox-input.browser.test.tsx',
  'packages/ui-components/src/components/inputs/tests/labeled-value.browser.test.tsx',
];

export default defineConfig(
  // base presets: js, typescript-eslint, react, react-hooks
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,

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

  // package-specific downgrades
  // ui-components: targeted downgrades only, to be tightened incrementally;
  // the new input family is excluded and held to the strict rules
  {
    files: ['packages/ui-components/**'],
    ignores: NEW_INPUT_FAMILY_STRICT,
    rules: {
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'react-you-might-not-need-an-effect/no-event-handler': 'warn',
      'react-you-might-not-need-an-effect/no-adjust-state-on-prop-change': 'warn',
      'react-you-might-not-need-an-effect/no-chain-state-updates': 'warn',
      'react-you-might-not-need-an-effect/no-derived-state': 'warn',
      'react-you-might-not-need-an-effect/no-pass-live-state-to-parent': 'warn',
      'react-you-might-not-need-an-effect/no-pass-data-to-parent': 'warn',
      'react-you-might-not-need-an-effect/no-external-store-subscription': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-compiler/react-compiler': 'warn',
    },
  },
  // new input family: strict; react-compiler diagnostics enforced
  {
    files: NEW_INPUT_FAMILY_STRICT,
    rules: {
      'react-compiler/react-compiler': 'error',
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
  // test-utils: strict, keeps react-compiler diagnostics visible
  {
    files: ['packages/test-utils/**'],
    rules: {
      'react-compiler/react-compiler': 'warn',
    },
  },
);
