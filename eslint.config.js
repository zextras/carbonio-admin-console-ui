/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const js = require('@eslint/js');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const eslintPluginImport = require('eslint-plugin-import');
const eslintPluginReact = require('eslint-plugin-react');
const eslintPluginReactHooks = require('eslint-plugin-react-hooks');
const eslintPluginJsxA11y = require('eslint-plugin-jsx-a11y');
const eslintPluginSonarjs = require('eslint-plugin-sonarjs');
const eslintPluginNotice = require('eslint-plugin-notice');
const eslintPluginTestingLibrary = require('eslint-plugin-testing-library');
const unusedImports = require('eslint-plugin-unused-imports');
const globals = require('globals');

module.exports = [
	// Base configuration
	js.configs.recommended,

	// Ignore patterns
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/build/**',
			'**/.turbo/**',
			'coverage/**',
			'*.config.js',
			'*.config.cjs',
			'**/__mocks__/**',
			'**/mocks/**',
			'./vitest.config.base.ts',
			'**/notice.template.ts'
		]
	},

	// Global configuration
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				__CARBONIO_DEV__: 'readonly',
				BASE_PATH: 'readonly',
				process: 'readonly',
				module: 'readonly',
				devUtilsNamespace: 'readonly',
				cliSettingsNamespace: 'readonly',
				JSX: 'readonly'
			},
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		settings: {
			react: {
				version: 'detect'
			}
		}
	},

	// All files - include all plugins to avoid "rule not found" errors
	{
		plugins: {
			'unused-imports': unusedImports,
			'@typescript-eslint': typescriptEslint,
			import: eslintPluginImport,
			react: eslintPluginReact,
			'react-hooks': eslintPluginReactHooks,
			'jsx-a11y': eslintPluginJsxA11y,
			sonarjs: eslintPluginSonarjs,
			notice: eslintPluginNotice,
			'testing-library': eslintPluginTestingLibrary,
			prettier: require('eslint-plugin-prettier')
		}
	},

	// TypeScript files
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: true,
				tsconfigRootDir: process.cwd()
			}
		},
		rules: {
			// TypeScript rules
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-expressions': [
				'warn',
				{
					allowShortCircuit: true,
					allowTernary: true,
					allowTaggedTemplates: true
				}
			],
			'@typescript-eslint/ban-ts-comment': 'off',

			// Prettier rules (disabled)
			'prettier/prettier': 'off',

			// Import rules
			'import/no-unresolved': 'off',
			'unused-imports/no-unused-imports': 'error',
			'import/named': 'off',
			'import/no-duplicates': 'warn',
			'import/no-named-default': 'warn',
			'import/order': [
				'warn',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true }
				}
			],

			// SonarJS rules (relaxed)
			'sonarjs/cognitive-complexity': ['warn', 25],
			'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
			'sonarjs/no-commented-code': 'warn',
			'sonarjs/todo-tag': 'warn',
			'sonarjs/no-hardcoded-passwords': 'warn',
			'sonarjs/no-nested-functions': 'warn',
			'sonarjs/no-nested-conditional': 'warn',
			'sonarjs/different-types-comparison': 'warn',
			'sonarjs/no-unused-vars': 'off',
			'sonarjs/no-dead-store': 'warn',
			'sonarjs/deprecation': 'warn',
			'sonarjs/slow-regex': 'warn',
			'sonarjs/regex-complexity': 'warn',
			'sonarjs/concise-regex': 'warn',
			'sonarjs/no-regex-spaces': 'warn',
			'sonarjs/no-redundant-optional': 'warn',

			// Notice rules
			'notice/notice': 'off', // Disabled for now

			// Disable conflicting base rules
			'no-unused-vars': 'off',
			'no-undef': 'off',
			'no-redeclare': 'off'
		}
	},

	// React/JSX files
	{
		files: ['**/*.{jsx,tsx}'],
		plugins: {
			react: eslintPluginReact,
			'react-hooks': eslintPluginReactHooks,
			'jsx-a11y': eslintPluginJsxA11y
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		settings: {
			react: {
				version: 'detect'
			}
		},
		rules: {
			// React rules
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'react/display-name': 'warn',
			'react/jsx-uses-react': 'error',
			'react/jsx-uses-vars': 'error',

			// React Hooks rules
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			// JSX A11y rules (relaxed)
			'jsx-a11y/click-events-have-key-events': 'warn',
			'jsx-a11y/no-static-element-interactions': 'warn',
			'jsx-a11y/anchor-is-valid': 'warn'
		}
	},

	// Test files
	{
		files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
		languageOptions: {},
		rules: {
			// Testing Library rules
			'testing-library/prefer-user-event': 'warn',
			'testing-library/no-node-access': 'warn',

			// Relaxed rules for tests
			'no-console': 'off',
			'sonarjs/no-duplicate-string': 'off',
			'sonarjs/no-hardcoded-passwords': 'off'
		}
	},

	// Common rules for all files
	{
		rules: {
			'no-console': ['warn', { allow: ['error', 'warn'] }],
			'prefer-const': 'warn',
			'no-var': 'error'
		}
	}
];
