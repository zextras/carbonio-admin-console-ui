/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListItems, ListPanelItem } from '@zextras/ui-components';
import { replaceHistory, useRelativePathname } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router';

import { LIST } from '../../constants';
import { type ManageOption } from '../../types/notifications';

export const NotificationsListPanel = () => {
  const [t] = useTranslation();
  const [isManageOptionsExpanded, setIsManageOptionsExpanded] = useState<boolean>(true);

  const relativePathname = useRelativePathname();
  const opMatch = matchPath(`/:operation`, relativePathname);
  const selectedOperationItem = opMatch?.params.operation ?? LIST;

  const manageOptions: Array<ManageOption> = [
    {
      id: LIST,
      name: t('notification.list', 'List'),
      isSelected: true,
    },
  ];

  const toggleManageSpecificOption = (): void => {
    setIsManageOptionsExpanded(!isManageOptionsExpanded);
  };

  const handleSelectOperation = (id: string): void => {
    replaceHistory(`/${id}`);
  };

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      background="gray5"
      style={{ overflow: 'auto', borderTop: '1px solid #FFFFFF' }}
    >
      <ListPanelItem
        title={t('notification.manage', 'Manage')}
        isListExpanded={isManageOptionsExpanded}
        setToggleView={toggleManageSpecificOption}
      />
      {isManageOptionsExpanded && (
        <ListItems
          items={manageOptions}
          selectedOperationItem={selectedOperationItem}
          setSelectedOperationItem={handleSelectOperation}
        />
      )}
    </Container>
  );
};
