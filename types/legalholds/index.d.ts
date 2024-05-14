/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type LegalHolds = {
	name: string;
	id: string;
	status: string;
};

export type BackupAccountItem = {
	name: string;
	id: string;
	status: string;
	legalHold: string;
};
