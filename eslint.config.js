import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "coverage/**",
      "scripts/**",
      "package/**",
      "**/*vitest*",
      "**/*webpack*",
      "**/sdk/**",
      "**/*.config.*",
    ],
  },
  {
    plugins: {
      "react-hooks": reactHooks,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-console": ["error", { allow: ["error"] }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // TODO: remove all the rules below this line once the codebase is cleaned up
      "react/no-children-prop": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.test.*"],
    rules: { "no-console": "off" },
  },
);
