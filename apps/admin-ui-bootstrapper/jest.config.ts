/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export default {
	collectCoverage: true,

	collectCoverageFrom: [
		'src/**/*.{js,ts,jsx,tsx}',

		// Exclude all test files and folders

		'!**/__mocks__/**', // Exclude mock files
		'!**/__tests__/**', // Exclude test files
		'!**/*.test.{js,jsx,ts,tsx}', // Exclude test files
		'!**/*.spec.{js,jsx,ts,tsx}', // Exclude test files
		'!src/tests/**', // Exclude test files from src/tests
		'!src/**/test/mocks/**', // Exclude test files from src/**/test/mocks

		// Exclude any file with mock or test prefix
		'!src/**/(test|mock)*.{js,ts,jsx,tsx}',

		// Exclude types and declarations
		'!src/**/*.d.ts',
		'!src/**/types/**',

		// Exclude test setup
		'!src/jest-env-setup.ts'
	],

	coverageDirectory: 'coverage',
	coverageProvider: 'babel',
	coverageReporters: ['lcov', 'html'],

	fakeTimers: {
		enableGlobally: true
	},

	globals: {
		BASE_PATH: '',
		__CARBONIO_DEV__: false
	},

	moduleDirectories: ['node_modules'],

	moduleNameMapper: {
		'^react-pdf': 'react-pdf/dist/cjs/entry.jest',
		'\\.(css|less)$': 'identity-obj-proxy',
		'^msw/node$': '<rootDir>/node_modules/msw/node'
	},

	modulePathIgnorePatterns: ['<rootDir>/.*/__mocks__'],

	reporters: ['default', 'jest-junit'],

	restoreMocks: true,

	setupFiles: ['<rootDir>/src/jest-polyfills.ts'],

	setupFilesAfterEnv: ['<rootDir>/src/jest-env-setup.ts'],

	testEnvironment: '<rootDir>/src/test/jsdom-extended.ts',

	testEnvironmentOptions: {
		customExportConditions: [''],
		url: 'http://localhost:6071/carbonioAdmin'
	},

	transform: {
		'^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './babel.config.jest.js' }],
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'./__mocks__/fileTransformer.js'
	}
};
