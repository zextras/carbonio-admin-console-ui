/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListItems, ListPanelItem } from '@zextras/ui-components';
import { useDomainById } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IS_DETAIL_LIST_EXPANDED, IS_MANAGE_LIST_EXPANDED } from '../../constants';
import type { Domain } from '../../store/types';
import { DomainSearchDropdown } from './components/domain-search-dropdown';
import { GlobalOptionsSection } from './global-options-section';
import { useDomainNavigation } from './hooks/use-domain-navigation';
import { useSidebarOptions } from './hooks/use-sidebar-options';

export const DomainSidebar = () => {
  const [t] = useTranslation();
  const { isDomainSelect, selectedDomainId, domainView, navigateToView } = useDomainNavigation();
  const [isDetailListExpanded, setIsDetailListExpanded] = useState(
    () => localStorage.getItem(IS_DETAIL_LIST_EXPANDED) !== 'false',
  );
  const [isManageListExpanded, setIsManageListExpanded] = useState(
    () => localStorage.getItem(IS_MANAGE_LIST_EXPANDED) !== 'false',
  );

  const { data: domainInformation } = useDomainById<Domain>({
    domainId: selectedDomainId || undefined,
  });

  const { manageOptions, detailItems, globalOptionsItems, isShowGlobalConfig } = useSidebarOptions(
    { isDomainSelect, domainInformation },
  );

  const toggleDetailView = (): void => {
    if (isDetailListExpanded) {
      setIsDetailListExpanded(false);
      localStorage.setItem(IS_DETAIL_LIST_EXPANDED, 'false');
    } else {
      setIsDetailListExpanded(true);
      localStorage.removeItem(IS_DETAIL_LIST_EXPANDED);
    }
  };

  const toggleManageView = (): void => {
    if (isManageListExpanded) {
      setIsManageListExpanded(false);
      localStorage.setItem(IS_MANAGE_LIST_EXPANDED, 'false');
    } else {
      setIsManageListExpanded(true);
      localStorage.removeItem(IS_MANAGE_LIST_EXPANDED);
    }
  };

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      background="gray5"
      style={{ overflow: 'auto', borderTop: '0.063rem solid #FFFFFF' }}
    >
      {isShowGlobalConfig && globalOptionsItems.length > 0 && (
        <GlobalOptionsSection
          globalOptionItems={globalOptionsItems}
          selectedOperationItem={domainView}
          setSelectedOperationItem={navigateToView}
        />
      )}

      <DomainSearchDropdown
        key={selectedDomainId || 'global'}
        isDomainSelect={isDomainSelect}
        domainInformation={domainInformation}
      />

      <ListPanelItem
        title={t('domain.manage', 'Manage')}
        isListExpanded={isManageListExpanded}
        setToggleView={toggleManageView}
      />
      {isManageListExpanded && (
        <ListItems
          items={manageOptions}
          selectedOperationItem={domainView}
          setSelectedOperationItem={navigateToView}
        />
      )}
      <ListPanelItem
        title={t('label.details', 'Details')}
        isListExpanded={isDetailListExpanded}
        setToggleView={toggleDetailView}
      />
      {isDetailListExpanded && (
        <ListItems
          items={detailItems}
          selectedOperationItem={domainView}
          setSelectedOperationItem={navigateToView}
        />
      )}
    </Container>
  );
};
