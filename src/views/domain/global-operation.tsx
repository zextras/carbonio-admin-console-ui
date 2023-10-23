/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { THEME, TWO_FACTOR_AUTHENTICATION, DOMAINS, GLOBAL_DELEGATES } from '../../constants';
import GlobalTheme from './global/global-theme';
import DomainList from './domain-list/domain-list';
import GlobalTwoFactorAuthentcation from './global/global-two-factor-auth';
import GlobalDelegates from './global-delegates';

const GlobalOperations: FC = () => {
	const [t] = useTranslation();
	const { operation }: { operation: string } = useParams();

	return (
		<>
			{((): any => {
				switch (operation) {
					case THEME:
						return <GlobalTheme />;
					case TWO_FACTOR_AUTHENTICATION:
						return <GlobalTwoFactorAuthentcation />;
					case DOMAINS:
						return <DomainList />;
					case GLOBAL_DELEGATES:
						return <GlobalDelegates />;
					default:
						return null;
				}
			})()}
		</>
	);
};
export default GlobalOperations;
