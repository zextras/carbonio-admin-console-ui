/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import DomainAuthentication from './details/domain-authentication';
import {
	GAL,
	GENERAL_INFORMATION,
	GENERAL_SETTINGS,
	VIRTUAL_HOSTS,
	AUTHENTICATION,
	MAILBOX_QUOTA,
	ACCOUNTS,
	MAILING_LIST,
	RESOURCES,
	RESTORE_ACCOUNT,
	RESTORE_DELETED_EMAIL
} from '../../constants';
import { getDomainInformation } from '../../services/domain-information-service';
import { searchDirectory } from '../../services/search-directory-service';
import DomainGalSettings from './details/domain-gal-settings';
import DomainGeneralSettings from './details/domain-general-settings';
import DomainMailboxQuotaSetting from './details/domain-mailbox-quota-settings';
import ManageAccounts from './manange/accounts/manage-accounts';
import DomainVirtualHosts from './details/domain-virtual-hosts';
import { useDomainStore } from '../../store/domain/store';
import DomainMailingList from './manange/mailing-list/domain-mailing-list';
import DomainResources from './manange/resources/domain-resources';
import RestoreAccount from './manange/restore-delete-account/restore-delete-account';

const DomainOperations: FC = () => {
	const [t] = useTranslation();
	const { operation, domainId }: { operation: string; domainId: string } = useParams();
	const setDomain = useDomainStore((state) => state.setDomain);
	const setCosList = useDomainStore((state) => state.setCosList);

	const getSelectedDomainInformation = useCallback(
		(id: any): any => {
			getDomainInformation(id)
				.then((response) => response.json())
				.then((data) => {
					const domain = data?.Body?.GetDomainResponse?.domain[0];
					if (domain) {
						setDomain(domain);
					}
				});
		},
		[setDomain]
	);

	const getClassOfService = useCallback(() => {
		const attrs = 'cn,description';
		const types = 'coses';

		searchDirectory(attrs, types, '', '')
			.then((response) => response.json())
			.then((data) => {
				const cosLists = data?.Body?.SearchDirectoryResponse?.cos;
				if (cosLists) {
					setCosList(cosLists);
				}
			});
	}, [setCosList]);

	useEffect(() => {
		getSelectedDomainInformation(domainId);
	}, [domainId, getSelectedDomainInformation]);

	useEffect(() => {
		getClassOfService();
	}, [getClassOfService]);

	return (
		<>
			{((): any => {
				switch (operation) {
					case GENERAL_INFORMATION:
						return <div>{t('label.general_information', 'General Information')}</div>;
					case GENERAL_SETTINGS:
						return <DomainGeneralSettings />;
					case GAL:
						return <DomainGalSettings />;
					case AUTHENTICATION:
						return <DomainAuthentication />;
					case VIRTUAL_HOSTS:
						return <DomainVirtualHosts />;
					case MAILBOX_QUOTA:
						return <DomainMailboxQuotaSetting />;
					case ACCOUNTS:
						return <ManageAccounts />;
					case MAILING_LIST:
						return <DomainMailingList />;
					case RESOURCES:
						return <DomainResources />;
					case RESTORE_ACCOUNT:
						return <RestoreAccount />;
					default:
						return null;
				}
			})()}
		</>
	);
};
export default DomainOperations;
