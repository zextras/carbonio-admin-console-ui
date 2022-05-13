/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import DomainAuthentication from './domain-authentication';
import {
	GAL,
	GENERAL_INFORMATION,
	GENERAL_SETTINGS,
	VIRTUAL_HOSTS,
	AUTHENTICATION,
	MAILBOX_QUOTA
} from '../../constants';
import { getDomainInformation } from '../../services/domain-information-service';
import { searchDirectory } from '../../services/search-directory-service';
import DomainGalSettings from './domain-gal-settings';
import DomainGeneralSettings from './domain-general-settings';
import DomainMailboxQuotaSetting from './domain-mailbox-quota-settings';
import DomainVirtualHosts from './domain-virtual-hosts';

const DomainOperations: FC = () => {
	const [t] = useTranslation();
	const [domainInformation, setDomainInformation] = useState([]);
	const [cosList, setCosList] = useState([]);
	const { operation, domainId }: { operation: string; domainId: string } = useParams();

	const getSelectedDomainInformation = useCallback((id: any): any => {
		getDomainInformation(id)
			.then((response) => response.json())
			.then((data) => {
				const domainInfo = data?.Body?.GetDomainResponse?.domain[0]?.a;
				if (!!data && !!domainInfo) {
					setDomainInformation(domainInfo);
				}
			});
	}, []);

	const getClassOfService = (): any => {
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
	};

	useEffect(() => {
		getSelectedDomainInformation(domainId);
	}, [domainId, getSelectedDomainInformation]);

	useEffect(() => {
		getClassOfService();
	}, []);

	return (
		<>
			{((): any => {
				switch (operation) {
					case GENERAL_INFORMATION:
						return <div>{t('label.general_information', 'General Information')}</div>;
					case GENERAL_SETTINGS:
						return (
							<DomainGeneralSettings domainInformation={domainInformation} cosList={cosList} />
						);
					case GAL:
						return <DomainGalSettings domainInformation={domainInformation} cosList={cosList} />;
					case AUTHENTICATION:
						return <DomainAuthentication domainInformation={domainInformation} />;
					case VIRTUAL_HOSTS:
						return <DomainVirtualHosts domainInformation={domainInformation} />;
					case MAILBOX_QUOTA:
						return <DomainMailboxQuotaSetting domainInformation={domainInformation} />;
					default:
						return null;
				}
			})()}
		</>
	);
};
export default DomainOperations;
