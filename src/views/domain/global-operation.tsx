/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import DomainList from './domain-list/domain-list';
import GlobalTheme from './global/global-theme';
import GlobalTwoFactorAuthentcation from './global/global-two-factor-auth';
import GlobalDelegates from './global-delegates';
import {
	TWO_FACTOR_AUTHENTICATION,
	DOMAINS,
	WHITELABEL_SETTINGS,
	GLOBAL_DELEGATES,
	QUARANTINE
} from '../../constants';
import QuarantineList from '../quarantine/quarantine-list';

const GlobalOperations: FC = () => {
	const [t] = useTranslation();
	const { operation }: { operation: string } = useParams();

	return (
		<>
			{((): any => {
				switch (operation) {
					case WHITELABEL_SETTINGS:
						return <GlobalTheme />;
					case TWO_FACTOR_AUTHENTICATION:
						return <GlobalTwoFactorAuthentcation />;
					case QUARANTINE:
						return <QuarantineList />;
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
