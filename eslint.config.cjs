/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const eslintPluginImport = require('eslint-plugin-import');
const eslintPluginReact = require('eslint-plugin-react');
const eslintPluginReactHooks = require('eslint-plugin-react-hooks');
const eslintPluginJsxA11y = require('eslint-plugin-jsx-a11y');
const eslintPluginSonarjs = require('eslint-plugin-sonarjs');
const eslintPluginNotice = require('eslint-plugin-notice');
const eslintPluginJest = require('eslint-plugin-jest');
const eslintPluginJestDom = require('eslint-plugin-jest-dom');
const eslintPluginTestingLibrary = require('eslint-plugin-testing-library');
const globals = require('globals');
const typescriptParser = require('@typescript-eslint/parser');
const js = require('@eslint/js');

module.exports = [
	// Base JavaScript config
	js.configs.recommended,

	// Ignore patterns
	{
		ignores: ['notice.template.ts']
	},

	// Global settings
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.jest
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
			},
			'import/resolver': {
				node: {
					moduleDirectory: ['node_modules', 'utils'],
					extensions: ['.js', '.jsx', '.d.ts', '.ts', '.tsx']
				}
			}
		}
	},

	// TypeScript config
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: './tsconfig.eslint.json',
				tsconfigRootDir: __dirname
			}
		},
		plugins: {
			'@typescript-eslint': typescriptEslint
		},
		rules: {
			...typescriptEslint.configs.recommended.rules,
			'@typescript-eslint/no-shadow': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},

	// Import plugin config
	{
		plugins: {
			import: eslintPluginImport
		},
		rules: {
			...eslintPluginImport.configs.recommended.rules,
			'import/order': [
				'warn',
				{
					groups: [['builtin', 'external']],
					pathGroups: [
						{
							pattern: 'react',
							group: 'external',
							position: 'before'
						}
					],
					pathGroupsExcludedImportTypes: ['react'],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true
					}
				}
			]
		}
	},

	// React plugins config
	{
		files: ['**/*.{jsx,tsx}'],
		plugins: {
			react: eslintPluginReact,
			'react-hooks': eslintPluginReactHooks,
			'jsx-a11y': eslintPluginJsxA11y
		},
		rules: {
			...eslintPluginReact.configs.recommended.rules,
			...eslintPluginReactHooks.configs.recommended.rules,
			...eslintPluginJsxA11y.configs.recommended.rules
		},
		settings: {
			react: {
				version: 'detect'
			}
		}
	},

	// special rules for declaration files
	{
		files: ['**/*.d.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'no-undef': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off'
		}
	},
	// SonarJS plugin config
	{
		plugins: {
			sonarjs: eslintPluginSonarjs
		},
		rules: {
			...eslintPluginSonarjs.configs.recommended.rules,
			'sonarjs/cognitive-complexity': 'warn',
			'sonarjs/no-collapsible-if': 'warn',
			'sonarjs/no-duplicate-string': 'warn',
			'sonarjs/no-duplicated-branches': 'warn',
			'sonarjs/no-identical-conditions': 'warn',
			'sonarjs/no-identical-expressions': 'warn',
			'sonarjs/no-redundant-boolean': 'warn',
			'sonarjs/no-small-switch': 'warn',
			'sonarjs/no-unused-collection': 'warn',
			'sonarjs/no-use-of-empty-return-value': 'warn',
			'sonarjs/prefer-immediate-return': 'warn',
			'sonarjs/prefer-object-literal': 'warn',
			'sonarjs/prefer-single-boolean-return': 'warn',
			'sonarjs/prefer-while': 'warn',
			'sonarjs/no-useless-catch': 'warn',
			'sonarjs/no-nested-template-literals': 'warn',
			'sonarjs/no-all-duplicated-branches': 'warn',
			'sonarjs/no-gratuitous-expressions': 'warn',
			'sonarjs/max-switch-cases': 'warn',
			'sonarjs/no-empty-collection': 'warn',
			'sonarjs/no-identical-functions': 'warn'
		}
	},

	// Notice plugin config
	{
		plugins: {
			notice: eslintPluginNotice
		},
		rules: {
			'notice/notice': [
				'error',
				{
					templateFile: 'notice.template.ts'
				}
			]
		}
	},

	// Common rules
	{
		rules: {
			'no-console': ['error', { allow: ['error', 'warn'] }],
			'no-param-reassign': [
				'warn',
				{
					props: true,
					ignorePropertyModificationsFor: ['accumulator', 'state', 'event']
				}
			]
		}
	},

	// Test files config
	{
		files: [
			'**/__tests__/**/*.[jt]s?(x)',
			'**/?(*.)+(spec|test).[jt]s?(x)',
			'**/test-setup.tsx',
			'jest-setup.ts'
		],
		plugins: {
			jest: eslintPluginJest,
			'jest-dom': eslintPluginJestDom,
			'testing-library': eslintPluginTestingLibrary
		},
		rules: {
			...eslintPluginJestDom.configs.recommended.rules,
			...eslintPluginTestingLibrary.configs.react.rules,
			'testing-library/no-global-regexp-flag-in-query': 'error',
			'testing-library/prefer-user-event': 'error',
			'import/no-extraneous-dependencies': 'off'
		}
	}
];
