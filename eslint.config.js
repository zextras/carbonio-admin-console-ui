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

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  // reactYouMightNotNeedAnEffect.configs.strict,
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
  {
    plugins: {
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
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-duplicate-imports': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/no-children-prop': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'react/prop-types': 'off',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  noticeConfig,
  {
    files: ['**/icons/**/*.[jt]sx'],
    rules: {
      'notice/notice': 'off',
    },
  },
  // this is the stricter eslint config we should be enforcing for all apps and packages
  // once all of them will be here, we can remove the ovrerrides and make the strict config default
  {
    files: [
      'packages/ui-components/src/components/custom/breadcrumb.tsx',
      'apps/admin-ui-domains/src/views/sidebar/**',
      'apps/admin-ui-domains/src/views/global/**',
      'apps/admin-ui-domains/src/views/manage/**',
      'apps/admin-ui-domains/src/views/details/**',
      'apps/admin-ui-domains/src/views/create-new-domain/**',
      'apps/admin-ui-domains/src/views/edit-account/**',
      'apps/admin-ui-dashboard/**',
      'apps/admin-ui-legalhold/**',
      'apps/admin-ui-bootstrap/**',
      'apps/admin-ui-privacy/**',
      'apps/admin-ui-operations/**',
      'apps/admin-ui-mta/**',
      'apps/admin-ui-cos/**',
      'apps/admin-ui-notifications/**',
      'apps/admin-ui-backup/**',
      'apps/admin-ui-subscription/**',
      'apps/admin-ui-storage/**',
    ],
    plugins: {
      'react-compiler': reactCompiler,
      'jsx-a11y': jsxA11y,
      'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffect,
    },
    rules: {
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/set-state-in-render': 'error',
      'react-hooks/refs': 'error',
      'react-hooks/immutability': 'error',
      'react-hooks/preserve-manual-memoization': 'error',
      'react-hooks/use-memo': 'error',
      'react-hooks/static-components': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-compiler/react-compiler': 'error',
      ...jsxA11y.configs.recommended.rules,
      ...reactYouMightNotNeedAnEffect.configs.strict.rules,
    },
  },
);
