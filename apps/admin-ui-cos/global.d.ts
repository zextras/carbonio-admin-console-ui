/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
declare const BASE_PATH: string;

declare module '*.svg' {
	const content: any;
	export default content;
}
