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
	ACL_LIST,
	MAILING_LIST,
	RESOURCES,
	RESTORE_ACCOUNT,
	RESTORE_DELETED_EMAIL,
	ACTIVE_SYNC,
	THEME,
	SAML,
	TWO_FACTOR_AUTHENTICATION,
	DELEGATES,
	SECURITY_GROUP
} from '../../constants';
import { getDomainInformation } from '../../services/domain-information-service';
import { searchDirectory } from '../../services/search-directory-service';
import DomainGalSettings from './details/domain-gal-settings';
import DomainGeneralSettings from './details/domain-general-settings';
import DomainMailboxQuotaSetting from './details/domain-mailbox-quota-settings';
import ManageAccounts from './manange/accounts/manage-accounts';
import DomainVirtualHosts from './details/virtual-hosts-certificates/domain-virtual-hosts';
import { useDomainStore } from '../../store/domain/store';
import DomainAclList from './manange/acl-groups/domain-acl-list';
import DomainMailingList from './manange/mailing-list/domain-mailing-list';
import DomainResources from './manange/resources/domain-resources';
import RestoreAccount from './manange/restore-delete-account/restore-delete-account';
import ActiveSync from './manange/active-sync/active-sync';
import DomainTheme from './details/domain-theme';
import DomainSaml from './details/domain-saml';
import DomainTwoFactorAuthentication from './details/domain-2fa';
import ManageDelegates from './manange/delegates/manage-delegates';

const DomainOperations: FC = () => {
	const [t] = useTranslation();
	const { operation, domainId }: { operation: string; domainId: string } = useParams();
	const setDomain = useDomainStore((state) => state.setDomain);
	const setCosList = useDomainStore((state) => state.setCosList);

	const getSelectedDomainInformation = useCallback(
		(id: any): any => {
			getDomainInformation(id).then((data) => {
				const domain = data?.domain[0];
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

		searchDirectory(attrs, types, '', '').then((data) => {
			const cosLists = data?.cos;
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
					case TWO_FACTOR_AUTHENTICATION:
						return <DomainTwoFactorAuthentication />;
					case THEME:
						return <DomainTheme />;
					case SAML:
						return <DomainSaml />;
					case ACCOUNTS:
						return <ManageAccounts />;
					case DELEGATES:
						return <ManageDelegates />;
					case MAILING_LIST:
						return <DomainMailingList />;
					case SECURITY_GROUP:
						return <DomainAclList />;
					case RESOURCES:
						return <DomainResources />;
					case RESTORE_ACCOUNT:
						return <RestoreAccount />;
					case ACTIVE_SYNC:
						return <ActiveSync />;
					default:
						return null;
				}
			})()}
		</>
	);
};
export default DomainOperations;
