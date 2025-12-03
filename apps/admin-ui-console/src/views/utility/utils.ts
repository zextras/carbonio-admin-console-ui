/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';

export const OperationsHeader = (
	t: TFunction
): Array<{
	id: string;
	label: string;
	width: string;
	bold: boolean;
	i18nAllLabel: string;
	align: string;
}> => [
	{
		id: 'Server',
		label: t('operations.operations_list_header.server', 'Server'),
		i18nAllLabel: 'All',
		width: '127px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Operation',
		label: t('operations.operations_list_header.operation', 'Operation'),
		i18nAllLabel: 'All',
		width: '127px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Secondary',
		label: t('operations.operations_list_header.author', 'Author'),
		i18nAllLabel: 'All',
		width: '177px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Index',
		label: t('operations.operations_list_header.submit_date', 'Submit date'),
		i18nAllLabel: 'All',
		width: '138px',
		bold: true,
		align: 'center'
	},
	{
		id: 'HSM Scheduling',
		label: t('operations.operations_list_header.start_date', 'Start date'),
		i18nAllLabel: 'All',
		width: '138px',
		bold: true,
		align: 'center'
	}
];

export const OperationsDoneHeader = (
	t: TFunction
): Array<{
	id: string;
	label: string;
	width: string;
	bold: boolean;
	i18nAllLabel: string;
	align: string;
}> => [
	{
		id: 'Server',
		label: t('operations.operations_list_header.server', 'Server'),
		i18nAllLabel: 'All',
		width: '177px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Operation',
		label: t('operations.operations_list_header.operation', 'Operation'),
		i18nAllLabel: 'All',
		width: '77px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Operation',
		label: t('operations.operations_list_header.status', 'Status'),
		i18nAllLabel: 'All',
		width: '57px',
		bold: true,
		align: 'center'
	},
	{
		id: 'Secondary',
		label: t('operations.operations_list_header.author', 'Author'),
		i18nAllLabel: 'All',
		width: '177px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Index',
		label: t('operations.operations_list_header.submit_date', 'Submit date'),
		i18nAllLabel: 'All',
		width: '138px',
		bold: true,
		align: 'left'
	},
	{
		id: 'HSM Scheduling',
		label: t('operations.operations_list_header.start_date', 'Start date'),
		i18nAllLabel: 'All',
		width: '138px',
		bold: true,
		align: 'left'
	}
];

export const bytesToSize = (bytes: number): string => {
	const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return 'n/a';
	const i: number = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
	if (i === 0) return `${bytes} ${sizes[i]}`;
	return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

export const copyTextToClipboard = (text: string): void => {
	if (navigator) {
		navigator.clipboard.writeText(text);
	}
};
