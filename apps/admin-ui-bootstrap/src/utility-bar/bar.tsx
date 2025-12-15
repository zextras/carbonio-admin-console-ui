/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Tooltip, Dropdown, Text, Button } from '@zextras/carbonio-design-system';
import { map, noop } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UtilityView } from '../../types/apps';
import {
	CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE,
	CARBONIO_CE_ADMIN_DOCUMENTATION_URL
} from '../constants';
import { logout } from '../network/logout';
import { useConfigAttribute } from '../react-query/use-config';
import { useIsAdvanced } from '../react-query/use-is-advanced-supported';
import { useUserAccount } from '../store/account';

import { useUtilityBarStore } from './store';
import { openLink, useUtilityViews } from './utils';

const UtilityBarItem: FC<{ view: UtilityView }> = ({ view }) => {
	const { mode, setMode, current, setCurrent } = useUtilityBarStore();
	const onClick = useCallback((): void => {
		setMode(current !== view.id ? 'open' : mode !== 'open' ? 'open' : 'closed');
		setCurrent(view.id);
	}, [current, mode, setCurrent, setMode, view.id]);
	if (typeof view.button === 'string') {
		return (
			<Tooltip label={view.label} placement="bottom-end">
				<Button
					type="ghost"
					color={current === view.id ? 'primary' : 'text'}
					icon={view.button}
					onClick={onClick}
					size="large"
				/>
			</Tooltip>
		);
	}
	return <view.button mode={mode} setMode={setMode} />;
};

export const ShellUtilityBar: FC = () => {
	const [accountName, setAccountName] = useState('');
	const views = useUtilityViews();
	const acct = useUserAccount();
	const isAdvanced = useIsAdvanced();
	const { data: helpDocumentationUrlAttribute } = useConfigAttribute(
		CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE
	);
	const helpDocumentationUrl = isAdvanced
		? helpDocumentationUrlAttribute || CARBONIO_CE_ADMIN_DOCUMENTATION_URL
		: CARBONIO_CE_ADMIN_DOCUMENTATION_URL;
	const [t] = useTranslation();
	const accountItems = useMemo(
		() => [
			{
				id: 'help',
				label: t('label.help_and_documentation', 'Help & Documentation'),
				onClick: () => openLink(helpDocumentationUrl),
				icon: 'QuestionMarkOutline'
			},
			{
				id: 'logout',
				label: t('label.logout', 'Logout'),
				onClick: (): void => {
					logout();
				},
				icon: 'LogOut'
			}
		],
		[helpDocumentationUrl, t]
	);

	const clipTextAfterWords = (text: string): string => {
		const words = text?.split('');
		const clippedText = words?.slice(0, 32).join('');
		return clippedText + (words?.length > 32 ? '...' : '');
	};

	useEffect(() => {
		if (acct?.name) {
			setAccountName(clipTextAfterWords(acct?.name));
		}
	}, [acct?.name]);

	return (
		<Container orientation="horizontal" width="fit">
			{map(views, (view) => (
				<UtilityBarItem view={view} key={view.id} />
			))}
			<Container margin={{ right: 'small' }}>
				<Text color="primary" style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
					{accountName}
				</Text>
			</Container>
			<Tooltip label={t('label.account_menu', 'Account menu')} placement="left-end">
				<Dropdown items={accountItems}>
					<Button
						type="ghost"
						icon="AvatarOutline"
						size={'extralarge'}
						color="primary"
						onClick={noop}
					/>
				</Dropdown>
			</Tooltip>
		</Container>
	);
};
