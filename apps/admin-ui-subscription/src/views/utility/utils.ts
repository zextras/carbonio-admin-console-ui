/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const EMAIL_VALIDATION_REGEX =
	/(^|\s)([\p{L}\p{N}._%+-]+@(?:[\p{L}\p{N}.-]+\.[\p{L}\p{N}]{2,}|\[[^\]\s<>]+\]))/gu;

export const isValidEmail = (email: string): boolean => {
	const match = email.trim().match(EMAIL_VALIDATION_REGEX);
	return match !== null && match[0].trim() === email.trim();
};

export const getAllEmailFromString = (str: string): any => {
	const matches = str.matchAll(EMAIL_VALIDATION_REGEX);
	return Array.from(matches, (match) => match[2]);
};

export const isValidProxy = (value: string): boolean => {
	const pattern = '(proxy|pcre|regexp|inline):(ldap:)?[/\\w.-]+';
	const validProxyRegex = new RegExp(`^${pattern}(( ,|, | , |,)${pattern})*$`);
	return validProxyRegex.test(value);
};

export function bytesToHumanReadable(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const sizeIndex = Math.min(i, sizes.length - 1);
	return `${parseFloat((bytes / 1024 ** sizeIndex).toFixed(2))} ${sizes[sizeIndex]}`;
}

export function bytesToMB(bytes: number): number {
	return parseFloat((bytes / 1024 / 1024).toFixed(2));
}

export function mbToBytes(mb: number): number {
	return mb * 1024 * 1024;
}
