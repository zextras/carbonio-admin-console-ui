/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useMemo, useState } from 'react';

import {
	ChipInput,
	ChipInputProps,
	DropdownItem,
	Row,
	Tooltip
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DomainsByFeature } from '../../../../../types';
import { CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE, TRUE } from '../../../../constants';
import { getDomainList } from '../../../../services/search-domain-service';
import { useConfigStore } from '../../../../store/config/store';
import { ZimbraDomainResponse } from '../../domain-list/domain-list';

const DomainListChipInput: FC<{
	domainName: string;
	domainList: DomainsByFeature[];
	setDomainList: (domainList: DomainsByFeature[]) => void;
}> = ({ domainList, setDomainList, domainName }) => {
	const [t] = useTranslation();
	const config = useConfigStore((state) => state.config);
	const [domainOption, setDomainOption] = useState<Array<DropdownItem>>([]);
	const getAllDomainList = useCallback(
		(searchQuery: string): void => {
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
		({ textContent }: { textContent: any }) => {
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

	const isEnableSearchAllDomainsByFeature: boolean = useMemo(() => {
		const carbonioSearchAllDomainsByFeature = config.filter(
			(item: Record<string, string>) => item?.n === CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE
		);
		return carbonioSearchAllDomainsByFeature[0]?._content === TRUE;
	}, [config]);

	return (
		<Tooltip
			placement="bottom"
			label={t(
				'domains.GeneralSettings.searchDomain.disabledTooltip',
				`To search users in specific domains, it is needed beforehand to disable the option "Allow searching users' information in all domains" in the global settings`
			)}
			disabled={!isEnableSearchAllDomainsByFeature}
		>
			<Row width={'fill'}>
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
					disabled={isEnableSearchAllDomainsByFeature}
					style={{ pointerEvents: isEnableSearchAllDomainsByFeature ? 'none' : 'auto' }}
				/>
			</Row>
		</Tooltip>
	);
};
export default DomainListChipInput;
