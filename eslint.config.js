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
import sonarjs from 'eslint-plugin-sonarjs';

import noticeConfig from './notice.config.js';

function toSeverity(rules, severity) {
  return Object.fromEntries(Object.keys(rules).map((rule) => [rule, severity]));
}

const useStateSymmetricNaming = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'useState results must be destructured into a symmetric value/setter pair (Sonar S6754)',
    },
    schema: [],
    messages: {
      asymmetric:
        "Rename this setter to 'set{{value}}' so the useState pair is symmetric (Sonar S6754).",
    },
  },
  create(context) {
    function isUseStateCall(node) {
      if (!node.init || node.init.type !== 'CallExpression') return false;
      const callee = node.init.callee;
      return (
        (callee.type === 'Identifier' && callee.name === 'useState') ||
        (callee.type === 'MemberExpression' && callee.property.name === 'useState')
      );
    }
    return {
      VariableDeclarator(node) {
        if (!isUseStateCall(node)) return;
        if (!node.id || node.id.type !== 'ArrayPattern') return;
        const [value, setter] = node.id.elements;
        if (!value || value.type !== 'Identifier' || !setter || setter.type !== 'Identifier') {
          return;
        }
        const expected = `set${value.name.charAt(0).toUpperCase()}${value.name.slice(1)}`;
        if (setter.name !== expected) {
          context.report({ node: setter, messageId: 'asymmetric', data: { value: value.name } });
        }
      },
    };
  },
};

const localPlugin = {
  rules: { 'use-state-symmetric-naming': useStateSymmetricNaming },
};

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
      sonarjs,
      local: localPlugin,
    },
    linterOptions: { reportUnusedDisableDirectives: 'error', reportUnusedInlineConfigs: 'error' },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-console': ['error', { allow: ['error'] }],
      'prefer-const': 'error',
      curly: ['error', 'multi-line', 'consistent'],
      'default-case': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
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
        {
          selector: "CallExpression[callee.object.name='React'][callee.property.name='memo']",
          message:
            'React Compiler memoizes automatically — export a plain component. See AGENTS.md.',
        },
        {
          selector: 'TemplateLiteral TemplateLiteral',
          message:
            'Nested template literals are not allowed (Sonar S4624) — extract the inner template into a variable.',
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
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/cyclomatic-complexity': ['warn', { threshold: 20 }],
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
      'sonarjs/no-element-overwrite': 'error',
      'local/use-state-symmetric-naming': 'error',
      ...jsxA11y.configs.recommended.rules,
      ...reactYouMightNotNeedAnEffect.configs.strict.rules,
    },
  },

  // test overrides
  // testing-library rules on unit tests, warn until existing findings are addressed
  {
    files: ['packages/*/src/**/*.{ts,tsx}', 'apps/*/src/**/*.{ts,tsx}'],
    languageOptions: { parserOptions: { projectService: true } },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },

  {
    files: ['**/*.test.*', '**/tests/**'],
    plugins: { 'testing-library': testingLibrary },
    rules: {
      ...toSeverity(testingLibrary.configs['flat/react'].rules, 'warn'),
      'sonarjs/no-duplicate-string': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
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
