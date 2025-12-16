/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
	ACTIVE_SYNC,
	ADMINISTRATORS,
	DOMAINS,
	QUARANTINE,
	SETTINGS,
	TWO_FACTOR_AUTHENTICATION,
	WHITELABEL_SETTINGS} from '../../constants';
import QuarantineList from '../quarantine/quarantine-list';
import DomainList from './domain-list/domain-list';
import GlobalActiveSync from './global/global-active-sync';
import GlobalDetailPanel from './global/global-detail-panel';
import GlobalTheme from './global/global-theme';
import GlobalTwoFactorAuthentcation from './global/global-two-factor-auth';
import GlobalDelegates from './global-delegates';

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
					case ADMINISTRATORS:
						return <GlobalDelegates />;
					case SETTINGS:
						return <GlobalDetailPanel />;
					case ACTIVE_SYNC:
						return <GlobalActiveSync />;
					default:
						return null;
				}
			})()}
		</>
	);
};
export default GlobalOperations;
