/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsx11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import jest from "eslint-plugin-jest";
import jestDom from "eslint-plugin-jest-dom";
import testingLibrary from "eslint-plugin-testing-library";
import sonarjs from "eslint-plugin-sonarjs";
import notice from "eslint-plugin-notice";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  // Global ignores
  {
    ignores: ["notice.template.ts"],
  },

  // Base configuration for all files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },

    plugins: {
      "@typescript-eslint": typescript,
      react: react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsx11y,
      import: importPlugin,
      jest: jest,
      "jest-dom": jestDom,
      "testing-library": testingLibrary,
      sonarjs: sonarjs,
      notice: notice,
    },

    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: {
          moduleDirectory: ["node_modules", "utils"],
          extensions: [".js", ".jsx", ".d.ts", ".ts", ".tsx"],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
    },

    rules: {
      // ESLint recommended rules
      ...js.configs.recommended.rules,

      // TypeScript rules
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-shadow": "warn",
      "@typescript-eslint/no-explicit-any": "warn",

      // React rules
      ...react.configs.recommended.rules,

      // React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // JSX a11y rules
      ...jsx11y.configs.recommended.rules,

      // Import rules
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external"]],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // SonarJS rules
      ...sonarjs.configs.recommended.rules,
      "sonarjs/cognitive-complexity": "warn",
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/no-duplicate-string": "warn",
      "sonarjs/no-duplicated-branches": "warn",
      "sonarjs/no-identical-conditions": "warn",
      "sonarjs/no-identical-expressions": "warn",
      "sonarjs/no-redundant-boolean": "warn",
      "sonarjs/no-small-switch": "warn",
      "sonarjs/no-unused-collection": "warn",
      "sonarjs/no-use-of-empty-return-value": "warn",
      "sonarjs/prefer-immediate-return": "warn",
      "sonarjs/prefer-object-literal": "warn",
      "sonarjs/prefer-single-boolean-return": "warn",
      "sonarjs/prefer-while": "warn",
      "sonarjs/no-useless-catch": "warn",
      "sonarjs/no-nested-template-literals": "warn",
      "sonarjs/no-all-duplicated-branches": "warn",
      "sonarjs/no-gratuitous-expressions": "warn",
      "sonarjs/max-switch-cases": "warn",
      "sonarjs/no-empty-collection": "warn",
      "sonarjs/no-identical-functions": "warn",

      // Notice plugin
      "notice/notice": [
        "error",
        {
          templateFile: "notice.template.ts",
        },
      ],

      // General rules
      "no-console": ["error", { allow: ["error", "warn"] }],
      "no-param-reassign": [
        "warn",
        {
          props: true,
          ignorePropertyModificationsFor: ["accumulator", "state", "event"],
        },
      ],

      // Prettier config (disables conflicting rules)
      ...prettier.rules,
    },
  },

  // Test files configuration
  {
    files: [
      "**/__tests__/**/*.[jt]s?(x)",
      "**/?(*.)+(spec|test).[jt]s?(x)",
      "**/test-setup.tsx",
      "jest-setup.ts",
    ],

    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },

    rules: {
      // Jest DOM rules
      ...jestDom.configs.recommended.rules,

      // Testing Library rules
      ...testingLibrary.configs.react.rules,
      "testing-library/no-global-regexp-flag-in-query": "error",
      "testing-library/prefer-user-event": "error",

      // Disable import rule for test files
      "import/no-extraneous-dependencies": "off",
    },
  },
];
