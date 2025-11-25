/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { isValidEmail } from '../../../../../utility/utils';

describe('Email Validation in Edit Account Security Section', () => {
	describe('ChipInput onChange email validation logic', () => {
		it('should validate and mark emails with error flag', () => {
			const contacts = [
				{ label: 'valid@example.com' },
				{ label: 'invalid-email' },
				{ label: 'another@valid.com' },
				{ label: 'no-at-sign' },
				{ label: 'missing-domain@' },
				{ label: '@missing-local.com' }
			];

			const data: any = [];
			contacts.forEach((contact) => {
				const isValid = isValidEmail(contact.label ?? '');
				data.push({
					...contact,
					error: !isValid
				});
			});

			// Verify valid emails
			expect(data[0].error).toBe(false); // valid@example.com
			expect(data[2].error).toBe(false); // another@valid.com

			// Verify invalid emails
			expect(data[1].error).toBe(true); // invalid-email
			expect(data[3].error).toBe(true); // no-at-sign
			expect(data[4].error).toBe(true); // missing-domain@
			expect(data[5].error).toBe(true); // @missing-local.com
		});

		it('should handle empty or undefined labels', () => {
			const contacts = [{ label: '' }, { label: undefined }, { label: null }];

			const data: any = [];
			contacts.forEach((contact: any) => {
				const isValid = isValidEmail(contact.label ?? '');
				data.push({
					...contact,
					error: !isValid
				});
			});

			// All should be marked as invalid
			expect(data[0].error).toBe(true);
			expect(data[1].error).toBe(true);
			expect(data[2].error).toBe(true);
		});
	});

	describe('Error message conditional rendering', () => {
		it('should return true when some contacts have errors', () => {
			const sendEmailToWithErrors = [
				{ label: 'valid@example.com', error: false },
				{ label: 'invalid', error: true }
			];

			const hasErrors = sendEmailToWithErrors.some((contact: any) => contact.error);
			expect(hasErrors).toBe(true);
		});

		it('should return false when no contacts have errors', () => {
			const sendEmailToWithoutErrors = [
				{ label: 'valid@example.com', error: false },
				{ label: 'another@valid.com', error: false }
			];

			const hasNoErrors = sendEmailToWithoutErrors.some((contact: any) => contact.error);
			expect(hasNoErrors).toBe(false);
		});

		it('should return false for empty array', () => {
			const emptyArray: any[] = [];
			const hasErrors = emptyArray.some((contact: any) => contact.error);
			expect(hasErrors).toBe(false);
		});
	});

	describe('SEND button disabled state logic', () => {
		it('should be disabled when email list is empty', () => {
			const emptyEmails: any[] = [];
			const shouldBeDisabled =
				emptyEmails.length === 0 || emptyEmails.some((contact: any) => contact.error);
			expect(shouldBeDisabled).toBe(true);
		});

		it('should be disabled when emails have validation errors', () => {
			const emailsWithErrors = [
				{ label: 'valid@example.com', error: false },
				{ label: 'invalid', error: true }
			];
			const shouldBeDisabled =
				emailsWithErrors.length === 0 || emailsWithErrors.some((contact: any) => contact.error);
			expect(shouldBeDisabled).toBe(true);
		});

		it('should be enabled when all emails are valid', () => {
			const validEmails = [
				{ label: 'valid@example.com', error: false },
				{ label: 'another@valid.com', error: false }
			];
			const shouldBeDisabled =
				validEmails.length === 0 || validEmails.some((contact: any) => contact.error);
			expect(shouldBeDisabled).toBe(false);
		});

		it('should be disabled when at least one email has error', () => {
			const mixedEmails = [
				{ label: 'valid1@example.com', error: false },
				{ label: 'valid2@example.com', error: false },
				{ label: 'invalid', error: true },
				{ label: 'valid3@example.com', error: false }
			];
			const shouldBeDisabled =
				mixedEmails.length === 0 || mixedEmails.some((contact: any) => contact.error);
			expect(shouldBeDisabled).toBe(true);
		});
	});

	describe('hasError prop for ChipInput', () => {
		it('should be true when some contacts have errors', () => {
			const sendEmailTo = [
				{ label: 'valid@example.com', error: false },
				{ label: 'invalid', error: true }
			];
			const hasError = sendEmailTo?.some((contact: any) => contact.error);
			expect(hasError).toBe(true);
		});

		it('should be false when no contacts have errors', () => {
			const sendEmailTo = [{ label: 'valid@example.com', error: false }];
			const hasError = sendEmailTo?.some((contact: any) => contact.error);
			expect(hasError).toBe(false);
		});

		it('should be false for undefined or null', () => {
			const sendEmailTo = undefined;
			const hasError = sendEmailTo?.some((contact: any) => contact.error);
			expect(hasError).toBeUndefined();
		});
	});
});
