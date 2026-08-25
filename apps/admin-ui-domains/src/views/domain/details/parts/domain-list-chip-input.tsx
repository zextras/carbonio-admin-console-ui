/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChipInput, type ChipInputProps, type DropdownItem, Row, Tooltip } from '@zextras/ui-components';
import { useAllConfig } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DomainsByFeature } from '../../../../../types';
import { CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE, TRUE } from '../../../../constants';
import { getDomainList } from '../../../../services/search-domain-service';
import { ZimbraDomainResponse } from '../../global/global-domain-list/global-domain-list';

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
  const [domainOption, setDomainOption] = useState<Array<DropdownItem>>([]);

  function getAllDomainList(searchQuery: string): void {
    getDomainList(searchQuery, 0, 10).then((data) => {
      const domainListResponse: ZimbraDomainResponse = data?.domain || [];
      if (domainListResponse && Array.isArray(domainListResponse)) {
        const domainListArr = domainListResponse.map((domain) => ({
          label: domain.name,
          id: domain.name,
        }));

        setDomainOption(domainListArr.filter((domain) => domain.id !== domainName));
      }
    });
  }

  const onInputType: NonNullable<ChipInputProps['onInputType']> = (event) => {
    getAllDomainList(event.textContent ?? '');
  };

  const onChange: NonNullable<ChipInputProps['onChange']> = (domainChipList) => {
    setDomainList(
      domainChipList.map((domain) => ({
        label: domain.label,
      })),
    );
  };

  const carbonioSearchAllDomainsByFeature = config.filter(
    (item: { n?: string; _content?: string }) => item?.n === CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE,
  );
  const isEnableSearchAllDomainsByFeature =
    carbonioSearchAllDomainsByFeature[0]?._content === TRUE;

  return (
    <Tooltip
      placement="bottom"
      label={t(
        'domains.GeneralSettings.searchDomain.disabledTooltip',
        `To search users in specific domains, it is needed beforehand to disable the option "Allow searching users' information in all domains" in the global settings`,
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
