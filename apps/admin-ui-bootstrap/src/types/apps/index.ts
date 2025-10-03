/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type CarbonioModule = {
	commit: string;
	description: string;
	js_entrypoint: string;
	name: string;
	priority: number;
	version: string;
	type: 'carbonio' | 'shell' | 'carbonioAdmin';
	attrKey?: string;
	icon: string;
	display: string;
	sentryDsn?: string;
};
