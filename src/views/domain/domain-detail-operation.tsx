/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GAL, GENERAL_INFORMATION, GENERAL_SETTINGS } from '../../constants';
import { getDomainInformation } from '../../services/domain-information-service';
import DomainGeneralSettings from './domain-general-settings';

const DomainOperations: FC = () => {
	const [domainInformation, setDomainInformation] = useState([]);
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

	useEffect(() => {
		getSelectedDomainInformation(domainId);
	}, [domainId, getSelectedDomainInformation]);
	return (
		<>
			{((): any => {
				switch (operation) {
					case GENERAL_INFORMATION:
						return <div>GENearl information</div>;
					case GENERAL_SETTINGS:
						return <DomainGeneralSettings domainInformation={domainInformation} />;
					case GAL:
						return <div>GAL</div>;
					default:
						return null;
				}
			})()}
		</>
	);
};
export default DomainOperations;
