/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): any {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			return initialValue;
		}
	});
	const setValue = (value: T | ((val: T) => T)): any => {
		const valueToStore = value instanceof Function ? value(storedValue) : value;
		setStoredValue(valueToStore);
		localStorage.setItem(key, JSON.stringify(valueToStore));
	};
	return [storedValue, setValue] as const;
}

export const isValidProxy = (value: string): boolean => {
	const pattern = '(proxy|pcre|regexp|inline):(ldap:)?[/\\w.-]+';
	const validProxyRegex = new RegExp(`^${pattern}(( ,|, | , |,)${pattern})*$`);
	return validProxyRegex.test(value);
};
export const isSpaceAvailableInString = (value: string): boolean => {
	const spaceRegex = /^\S*$/;
	return !spaceRegex.test(value);
};

export const isValidHostname = (hostname: string): boolean => {
	const hostnameRegex = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*(?<!-)$/;
	return hostnameRegex.test(hostname);
};

export const validateIpAddress = (value: string): boolean => {
	const ipv4Regex =
		/^(!?)(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\/([0-9]|[12][0-9]|3[0-2])$/;
	const ipv6Regex =
		/^(!?)\[(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\]\/([0-9]|[1-9][0-9]|1[01][0-9]|12[0-8])$/;

	return ipv4Regex.test(value) || ipv6Regex.test(value);
};

export function bytesToMB(bytes: number): number {
	return parseFloat((bytes / 1024 / 1024).toFixed(2));
}

export function mbToBytes(mb: number): number {
	return mb * 1024 * 1024;
}
