/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const bytesToSize = (bytes: number): string => {
	const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return 'n/a';
	const i: number = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
	if (i === 0) return `${bytes} ${sizes[i]}`;
	return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};
