/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Dropdown } from '@zextras/ui-components';
import {
  type Action,
  ACTION_TYPES,
  type AppRoute,
  useActions,
  useAppList,
} from '@zextras/ui-shared';
import { groupBy, noop, reduce } from 'lodash-es';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

const useSecondaryActions = (
  actions: Array<Action>,
  activeRoute?: AppRoute,
): Array<Action | { type: string; id: string }> => {
  const apps = useAppList();

  const byApp = useMemo(() => groupBy(actions, 'group'), [actions]);
  return useMemo(
    () => [
      ...(byApp[activeRoute?.app ?? ''] ?? []),
      ...reduce(
        apps,
        (acc, app, i) => {
          if (app.name !== activeRoute?.app && byApp[app.name]?.length > 0) {
            acc.push({ type: 'divider', label: '', id: `divider-${i}` }, ...byApp[app.name]);
          }
          return acc;
        },
        [] as Array<Action | { type: string; id: string }>,
      ),
    ],
    [activeRoute?.app, apps, byApp],
  );
};

export const CreationButton: FC<{ activeRoute?: AppRoute }> = ({ activeRoute }) => {
  const [t] = useTranslation();
  const location = useLocation();
  const actions = useActions({ activeRoute, location }, ACTION_TYPES.NEW);
  const [open, setOpen] = useState(false);
  const secondaryActions = useSecondaryActions(actions, activeRoute) as any;

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);
  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);
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
