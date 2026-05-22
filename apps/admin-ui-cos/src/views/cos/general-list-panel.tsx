/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ListItems, ListItemType, ListPanelItem } from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { COS_LIST, IS_GENERAL_LIST_EXPANDED } from '../../constants';
import { useCosStore } from '../../store/cos/store';

type GeneralListPanelProps = {
  generalOptionItems: Array<ListItemType>;
};

const GeneralListPanel: FC<GeneralListPanelProps> = ({ generalOptionItems }) => {
  const [t] = useTranslation();
  const [isGeneralListExpanded, setIsGeneralListExpanded] = useState(true);
  const { cosView, setCosView } = useCosStore();

  const navigateToGeneralView = (view: string) => {
    setCosView(view);
    if (view === COS_LIST) {
      replaceHistory(`/${COS_LIST}`);
    }
  };

  const toggleGeneralView = (): void => {
    if (isGeneralListExpanded) {
      setIsGeneralListExpanded(false);
      localStorage.setItem(IS_GENERAL_LIST_EXPANDED, 'false');
    } else {
      setIsGeneralListExpanded(true);
      localStorage.removeItem(IS_GENERAL_LIST_EXPANDED);
    }
  };

  useEffect(() => {
    const storedValue = localStorage.getItem(IS_GENERAL_LIST_EXPANDED);
    if (storedValue === 'false') {
      setIsGeneralListExpanded(false);
    } else {
      setIsGeneralListExpanded(true);
    }
  }, []);

  return (
    <>
      <ListPanelItem
        title={t('label.general', 'General')}
        isListExpanded={isGeneralListExpanded}
        setToggleView={toggleGeneralView}
      />
      {isGeneralListExpanded && (
        <ListItems
          items={generalOptionItems}
          selectedOperationItem={cosView}
          setSelectedOperationItem={navigateToGeneralView}
        />
      )}
    </>
  );
};

export default GeneralListPanel;
