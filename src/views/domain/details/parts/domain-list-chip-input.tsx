/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useState } from 'react';

import { ChipInput, ChipInputProps, DropdownItem } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DomainsByFeature } from '../../../../../types';
import { getDomainList } from '../../../../services/search-domain-service';
import { ZimbraDomainResponse } from '../../domain-list/domain-list';

const DomainListChipInput: FC<{
	domainName: string;
	domainList: DomainsByFeature[];
	setDomainList: (domainList: DomainsByFeature[]) => void;
}> = ({ domainList, setDomainList, domainName }) => {
	const [t] = useTranslation();
	const [domainOption, setDomainOption] = useState<Array<DropdownItem>>([]);
	const getAllDomainList = useCallback(
		(searchQuery): void => {
			getDomainList(searchQuery, 0, 10).then((data) => {
				const domainListResponse: ZimbraDomainResponse = data?.domain || [];
				if (domainListResponse && Array.isArray(domainListResponse)) {
					const domainListArr = domainListResponse.map((domain) => ({
						label: domain.name,
						id: domain.name
					}));

					setDomainOption(domainListArr.filter((domain) => domain.id !== domainName));
				}
			});
		},
		[domainName]
	);

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		({ textContent }) => {
			getAllDomainList(textContent);
		},
		[getAllDomainList]
	);

	const onChange = useCallback<NonNullable<ChipInputProps['onChange']>>(
		(domainChipList) => {
			setDomainList(
				domainChipList.map((domain) => ({
					label: domain.label
				}))
			);
		},
		[setDomainList]
	);

	return (
		<ChipInput
			data-testid={'domain-input'}
			disableOptions
			confirmChipOnBlur={false}
			onInputType={onInputType}
			options={domainOption}
			value={domainList}
			onChange={onChange}
			requireUniqueChips
			separators={[]}
			placeholder={t('domains.GeneralSettings.searchDomain.label', 'Search Domain')}
		/>
	);
};
export default DomainListChipInput;
