/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Dropdown, type DropdownItem } from '@zextras/ui-components';
import {
  type Action,
  ACTION_TYPES,
  type AppRoute,
  useActions,
  useAppList,
} from '@zextras/ui-shared';
import { groupBy, noop, reduce } from 'lodash-es';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

function toDropdownItem(action: Action): DropdownItem {
  return {
    disabled: action.disabled,
    icon: action.icon as DropdownItem['icon'],
    id: action.id,
    label: action.label,
    onClick: action.onClick,
    tooltipLabel: action.tooltipLabel,
  };
}

const useSecondaryActions = (
  actions: Array<Action>,
  activeRoute?: AppRoute,
): Array<DropdownItem> => {
  const apps = useAppList();

  const byApp = groupBy(actions, 'group');
  return [
    ...(byApp[activeRoute?.app ?? ''] ?? []).map(toDropdownItem),
    ...reduce(
      apps,
      (acc, app, i) => {
        if (app.name !== activeRoute?.app && byApp[app.name]?.length > 0) {
          acc.push(
            { id: `divider-${i}`, label: '', type: 'divider' },
            ...byApp[app.name].map(toDropdownItem),
          );
        }
        return acc;
      },
      [] as Array<DropdownItem>,
    ),
  ];
};

export const CreationButton: FC<{ activeRoute?: AppRoute }> = ({ activeRoute }) => {
  const [t] = useTranslation();
  const location = useLocation();
  const actions = useActions({ activeRoute, location }, ACTION_TYPES.NEW);
  const [open, setOpen] = useState(false);
  const secondaryActions = useSecondaryActions(actions, activeRoute);

  const onClose = () => {
    setOpen(false);
  };
  const onOpen = () => {
    setOpen(true);
  };
  return (
    <Dropdown items={secondaryActions} onClose={onClose} onOpen={onOpen}>
      <Button
        style={{ height: '2.625rem', padding: '0.5rem 0.75rem 0.5rem 0.75rem ' }}
        label={t('create', 'Create')}
        icon={open ? 'ChevronUp' : 'ChevronDown'}
        minWidth={'max-content'}
        onClick={noop}
      />
    </Dropdown>
  );
};
