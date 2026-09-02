/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChipInput, type ChipInputProps, type DropdownItem, Tooltip } from '@zextras/ui-components';
import { useAllConfig, useDebouncedValue } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DomainsByFeature } from '../../../../../types';
import { CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE, TRUE } from '../../../../constants';
import { useDomainSearch } from '../../../../services/use-domain-search';

type DomainListChipInputProps = {
  domainName: string;
  domainList: Array<DomainsByFeature>;
  setDomainList: (domainList: Array<DomainsByFeature>) => void;
};

export const DomainListChipInput = ({
  domainList,
  setDomainList,
  domainName,
}: DomainListChipInputProps) => {
  const [t] = useTranslation();
  const { data: config = [] } = useAllConfig();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebouncedValue(searchValue, 700);

  const { data } = useDomainSearch({
    searchQuery: debouncedSearchValue,
    limit: 10,
    offset: 0,
    enabled: debouncedSearchValue !== '',
  });

  const domainOption: Array<DropdownItem> =
    debouncedSearchValue === ''
      ? []
      : (data?.domain ?? [])
          .filter((domain) => domain.name !== domainName)
          .map((domain) => ({
            label: domain.name,
            id: domain.name,
          }));

  const onInputType: NonNullable<ChipInputProps['onInputType']> = (event) => {
    setSearchValue(event.textContent ?? '');
  };

  const onChange: NonNullable<ChipInputProps['onChange']> = (domainChipList) => {
    setDomainList(
      domainChipList.map((domain) => ({
        label: domain.label,
      })),
    );
  };

  const isEnableSearchAllDomainsByFeature =
    config.find(
      (item: { n?: string }) => item?.n === CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE,
    )?._content === TRUE;

  return (
    <Tooltip
      placement="bottom"
      label={t(
        'domains.GeneralSettings.searchDomain.disabledTooltip',
        `To search users in specific domains, it is needed beforehand to disable the option "Allow searching users' information in all domains" in the global settings`,
      )}
      disabled={!isEnableSearchAllDomainsByFeature}
    >
      <div className="w-full">
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
      </div>
    </Tooltip>
  );
};
