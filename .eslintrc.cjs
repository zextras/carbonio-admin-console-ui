/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
const path = require("path");

module.exports = {
  root: true, // Important: Mark this as root config
  extends: [
    require.resolve("@zextras/carbonio-ui-configs/rules/eslint"),
    "plugin:jest-dom/recommended",
    "plugin:testing-library/react",
  ],
  plugins: [
    "unused-imports",
    "jest-dom",
    "testing-library",
    "notice",
    "sonarjs",
  ],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: [
          "node_modules",
          "src/",
          "apps/*/src",
          "packages/*/src",
        ],
      },
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
  },
  overrides: [
    {
      files: ["**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      extends: ["@typescript-eslint/recommended"],
      rules: {
        "@typescript-eslint/no-shadow": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
      },
    },
    {
      files: [
        "**/__tests__/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)",
        "**/test-setup.tsx",
      ],
      rules: {
        "testing-library/no-global-regexp-flag-in-query": "error",
        "testing-library/prefer-user-event": "error",
        "import/no-extraneous-dependencies": "off",
      },
    },
  ],
  rules: {
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
    "no-console": ["error", { allow: ["error", "warn"] }],
    "notice/notice": [
      "error",
      {
        templateFile: path.resolve(__dirname, ".reuse/template.js"),
      },
    ],
    "no-param-reassign": [
      "warn",
      {
        props: true,
        ignorePropertyModificationsFor: ["accumulator", "state", "event"],
      },
    ],
    "unused-imports/no-unused-imports": "warn",
  },
};
