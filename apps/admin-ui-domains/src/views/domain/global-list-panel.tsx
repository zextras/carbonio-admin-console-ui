/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ListItems, type ListItemType, ListPanelItem } from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IS_GLOBAL_LIST_EXPANDED } from '../../constants';

type GlobalListPanelProps = {
  globalOptionItems: Array<ListItemType>;
  selectedOperationItem: string | null;
  setSelectedOperationItem: (id: string) => void;
};

export const GlobalListPanel = ({
  globalOptionItems,
  selectedOperationItem,
  setSelectedOperationItem,
}: GlobalListPanelProps) => {
  const [t] = useTranslation();
  const [isGlobalListExpanded, setIsGlobalListExpanded] = useState(
    () => localStorage.getItem(IS_GLOBAL_LIST_EXPANDED) !== 'false',
  );

  const toggleGlobalView = (): void => {
    if (isGlobalListExpanded) {
      setIsGlobalListExpanded(false);
      localStorage.setItem(IS_GLOBAL_LIST_EXPANDED, 'false');
    } else {
      setIsGlobalListExpanded(true);
      localStorage.removeItem(IS_GLOBAL_LIST_EXPANDED);
    }
  };

  return (
    <>
      <ListPanelItem
        title={t('label.global', 'Global')}
        isListExpanded={isGlobalListExpanded}
        setToggleView={toggleGlobalView}
      />
      {isGlobalListExpanded && (
        <ListItems
          items={globalOptionItems}
          selectedOperationItem={selectedOperationItem}
          setSelectedOperationItem={setSelectedOperationItem}
        />
      )}
    </>
  );
};
