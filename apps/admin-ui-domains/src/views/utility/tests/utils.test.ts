/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect,test } from 'vitest';

import {
	bytesToHumanReadable,
	bytesToMB,
	getAllEmailFromString,
	isValidEmail,
	mbToBytes} from '../utils';

describe('bytesToHumanReadable', () => {
	test('Zero bytes', () => {
		expect(bytesToHumanReadable(0)).toBe('0 Bytes');
	});

	test('Bytes under 1 KB', () => {
		expect(bytesToHumanReadable(500)).toBe('500 Bytes');
		expect(bytesToHumanReadable(1023)).toBe('1023 Bytes');
	});

	test('Kilobytes', () => {
		expect(bytesToHumanReadable(1024)).toBe('1 KB');
		expect(bytesToHumanReadable(1536)).toBe('1.5 KB');
		expect(bytesToHumanReadable(1048575)).toBe('1024 KB');
	});

	test('Megabytes', () => {
		expect(bytesToHumanReadable(1048576)).toBe('1 MB');
		expect(bytesToHumanReadable(1572864)).toBe('1.5 MB');
		expect(bytesToHumanReadable(1073741823)).toBe('1024 MB');
	});

	test('Gigabytes', () => {
		expect(bytesToHumanReadable(1073741824)).toBe('1 GB');
		expect(bytesToHumanReadable(1610612736)).toBe('1.5 GB');
		expect(bytesToHumanReadable(1099511627775)).toBe('1024 GB');
	});

	test('Terabytes', () => {
		expect(bytesToHumanReadable(1099511627776)).toBe('1 TB');
		expect(bytesToHumanReadable(1649267441664)).toBe('1.5 TB');
		expect(bytesToHumanReadable(1125899906842500)).toBe('1024 TB');
	});

	test('Petabytes', () => {
		expect(bytesToHumanReadable(1125899906842624)).toBe('1 PB');
		expect(bytesToHumanReadable(1688849860263936)).toBe('1.5 PB');
	});

	test('Extremely large numbers', () => {
		expect(bytesToHumanReadable(1e24)).toBe('847.03 ZB');
	});

	test('should give 1 mb of 1048576 bytes', () => {
		expect(bytesToMB(1048576)).toBe(1);
	});

	test('should give 0 if pass 0', () => {
		expect(bytesToMB(0)).toBe(0);
	});

	test('should give 2097152 bytes if pass 2 mb', () => {
		expect(mbToBytes(2)).toBe(2097152);
	});

	test('should give 0 bytes if pass 0 mb', () => {
		expect(mbToBytes(0)).toBe(0);
	});
});

describe('isValidEmail', () => {
	describe('Valid email addresses', () => {
		test('should validate simple email', () => {
			expect(isValidEmail('test@example.com')).toBe(true);
		});

		test('should validate email with subdomain', () => {
			expect(isValidEmail('user@mail.example.com')).toBe(true);
		});

		test('should validate email with multiple subdomains', () => {
			expect(isValidEmail('admin@server.mail.example.com')).toBe(true);
		});

		test('should validate email with dots in local part', () => {
			expect(isValidEmail('first.last@example.com')).toBe(true);
			expect(isValidEmail('user.name.long@example.com')).toBe(true);
		});

		test('should validate email with plus sign', () => {
			expect(isValidEmail('user+tag@example.com')).toBe(true);
			expect(isValidEmail('user+tag+extra@example.com')).toBe(true);
		});

		test('should validate email with underscore', () => {
			expect(isValidEmail('user_name@example.com')).toBe(true);
			expect(isValidEmail('first_last@test.com')).toBe(true);
		});

		test('should validate email with hyphen in domain', () => {
			expect(isValidEmail('user@test-domain.com')).toBe(true);
			expect(isValidEmail('admin@my-company.co.uk')).toBe(true);
		});

		test('should validate email with numbers', () => {
			expect(isValidEmail('user123@example.com')).toBe(true);
			expect(isValidEmail('123user@test456.com')).toBe(true);
		});

		test('should validate email with long TLD', () => {
			expect(isValidEmail('user@example.museum')).toBe(true);
			expect(isValidEmail('admin@company.international')).toBe(true);
		});

		test('should validate email with two-letter TLD', () => {
			expect(isValidEmail('user@example.co')).toBe(true);
			expect(isValidEmail('admin@test.uk')).toBe(true);
		});

		test('should validate email with multiple domain levels', () => {
			expect(isValidEmail('user@example.co.uk')).toBe(true);
			expect(isValidEmail('admin@mail.server.example.org')).toBe(true);
		});

		test('should validate email with Unicode characters (internationalized)', () => {
			expect(isValidEmail('café@example.com')).toBe(true);
			expect(isValidEmail('user@café.com')).toBe(true);
			expect(isValidEmail('José@example.com')).toBe(true);
		});

		test('should validate email with percentage sign', () => {
			expect(isValidEmail('user%test@example.com')).toBe(true);
		});

		test('should validate email with trimmed whitespace', () => {
			expect(isValidEmail('  test@example.com  ')).toBe(true);
			expect(isValidEmail('\tuser@example.com\t')).toBe(true);
		});
	});

	describe('Invalid email addresses', () => {
		test('should reject email without @', () => {
			expect(isValidEmail('userexample.com')).toBe(false);
			expect(isValidEmail('plaintext')).toBe(false);
		});

		test('should reject email without domain', () => {
			expect(isValidEmail('user@')).toBe(false);
			expect(isValidEmail('test@.')).toBe(false);
		});

		test('should reject email without local part', () => {
			expect(isValidEmail('@example.com')).toBe(false);
		});

		test('should reject email with spaces', () => {
			expect(isValidEmail('test user@example.com')).toBe(false);
			expect(isValidEmail('user@example domain.com')).toBe(false);
			expect(isValidEmail('user @example.com')).toBe(false);
		});

		test('should reject email without TLD', () => {
			expect(isValidEmail('user@domain')).toBe(false);
		});

		test('should reject email with single character TLD', () => {
			expect(isValidEmail('user@example.c')).toBe(false);
		});

		test('should reject email with double @', () => {
			expect(isValidEmail('user@@example.com')).toBe(false);
			expect(isValidEmail('user@test@example.com')).toBe(false);
		});

		test('should reject empty string', () => {
			expect(isValidEmail('')).toBe(false);
		});

		test('should reject only whitespace', () => {
			expect(isValidEmail('   ')).toBe(false);
			expect(isValidEmail('\t\n')).toBe(false);
		});

		test('should reject incomplete domain', () => {
			expect(isValidEmail('user@.com')).toBe(false);
			expect(isValidEmail('user@domain.')).toBe(false);
		});

		test('should reject special characters not allowed', () => {
			expect(isValidEmail('user#name@example.com')).toBe(false);
			expect(isValidEmail('user*name@example.com')).toBe(false);
		});
	});
});

describe('getAllEmailFromString', () => {
	describe('Extracting emails from strings', () => {
		test('should extract single email from string', () => {
			const result = getAllEmailFromString('Contact us at support@example.com');
			expect(result).toEqual(['support@example.com']);
		});

		test('should extract multiple emails from string', () => {
			const result = getAllEmailFromString(
				'Contact us at support@example.com or sales@example.org'
			);
			expect(result).toEqual(['support@example.com', 'sales@example.org']);
		});

		test('should extract emails with various separators', () => {
			const result = getAllEmailFromString('Emails: john.doe+tag@example.com, jane_doe@test.co.uk');
			expect(result).toEqual(['john.doe+tag@example.com', 'jane_doe@test.co.uk']);
		});

		test('should extract emails separated by spaces', () => {
			const result = getAllEmailFromString(
				'Multiple: test@example.com user@test.org admin@company.net'
			);
			expect(result).toEqual(['test@example.com', 'user@test.org', 'admin@company.net']);
		});

		test('should extract emails from comma-separated list', () => {
			const result = getAllEmailFromString('user1@test.com, user2@test.com, user3@test.com');
			expect(result).toEqual(['user1@test.com', 'user2@test.com', 'user3@test.com']);
		});

		test('should extract emails from semicolon-separated list', () => {
			const result = getAllEmailFromString('admin@example.com; support@example.com');
			expect(result).toEqual(['admin@example.com', 'support@example.com']);
		});

		test('should extract emails with newlines', () => {
			const result = getAllEmailFromString('First: test@example.com\nSecond: user@test.org');
			expect(result).toEqual(['test@example.com', 'user@test.org']);
		});

		test('should extract emails with tabs', () => {
			const result = getAllEmailFromString('Email1:\ttest@example.com\tEmail2:\tuser@test.org');
			expect(result).toEqual(['test@example.com', 'user@test.org']);
		});

		test('should extract email at the beginning of string', () => {
			const result = getAllEmailFromString('admin@example.com is the admin email');
			expect(result).toEqual(['admin@example.com']);
		});

		test('should extract email at the end of string', () => {
			const result = getAllEmailFromString('Send message to admin@example.com');
			expect(result).toEqual(['admin@example.com']);
		});

		test('should extract emails with Unicode characters', () => {
			const result = getAllEmailFromString('Contact café@example.com or José@test.org');
			expect(result).toEqual(['café@example.com', 'José@test.org']);
		});

		test('should extract emails with plus signs', () => {
			const result = getAllEmailFromString('Tags: user+tag1@example.com user+tag2@example.com');
			expect(result).toEqual(['user+tag1@example.com', 'user+tag2@example.com']);
		});

		test('should extract emails with underscores', () => {
			const result = getAllEmailFromString('Users: first_last@example.com user_name@test.org');
			expect(result).toEqual(['first_last@example.com', 'user_name@test.org']);
		});

		test('should extract emails with dots in local part', () => {
			const result = getAllEmailFromString('Contacts: john.doe@example.com jane.smith@test.org');
			expect(result).toEqual(['john.doe@example.com', 'jane.smith@test.org']);
		});

		test('should extract emails with subdomains', () => {
			const result = getAllEmailFromString('Servers: admin@mail.example.com user@server.test.org');
			expect(result).toEqual(['admin@mail.example.com', 'user@server.test.org']);
		});

		test('should extract email at start even after special characters', () => {
			const result = getAllEmailFromString('support@example.com');
			expect(result).toEqual(['support@example.com']);
		});

		test('should extract multiple emails from formatted list', () => {
			const result = getAllEmailFromString(
				'To: admin@example.com\nCC: user@test.org\nBCC: support@company.net'
			);
			expect(result).toEqual(['admin@example.com', 'user@test.org', 'support@company.net']);
		});
	});

	describe('Edge cases and empty results', () => {
		test('should return empty array when no emails found', () => {
			const result = getAllEmailFromString('No emails here!');
			expect(result).toEqual([]);
		});

		test('should return empty array for empty string', () => {
			const result = getAllEmailFromString('');
			expect(result).toEqual([]);
		});

		test('should return empty array for whitespace only', () => {
			const result = getAllEmailFromString('   \t\n   ');
			expect(result).toEqual([]);
		});

		test('should ignore invalid email patterns', () => {
			const result = getAllEmailFromString('Invalid: user@ @example.com user@@test.com');
			expect(result).toEqual([]);
		});

		test('should extract valid emails and ignore invalid ones', () => {
			const result = getAllEmailFromString(
				'Valid: test@example.com Invalid: user@ Also valid: admin@test.org'
			);
			expect(result).toEqual(['test@example.com', 'admin@test.org']);
		});

		test('should handle string with only partial email patterns', () => {
			const result = getAllEmailFromString('user@ @domain.com domain.com');
			expect(result).toEqual([]);
		});

		test('should extract emails from mixed valid/invalid content', () => {
			const result = getAllEmailFromString(
				'Contact support@example.com or visit www.example.com or call 123-456-7890'
			);
			expect(result).toEqual(['support@example.com']);
		});
	});
});
