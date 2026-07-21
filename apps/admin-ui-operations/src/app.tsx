/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { addRoute, useIsAdvanced } from '@zextras/ui-shared';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { LOG_AND_QUEUES, OPERATIONS_ROUTE_ID, PRIMARY_BAR_OPERATIONS } from './constants';
import { AppView } from './views/app-view';

const App: FC = () => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();

  const logAndQueuesSection = useMemo(
    () => ({
      id: LOG_AND_QUEUES,
      label: t('label.long_and_queues', 'Log & Queues'),
      position: 5,
    }),
    [t],
  );

  const OperationTooltipView: FC = useCallback(
    () => (
      <PrimaryBarTooltip>
        <p>
          <Trans
            i18nKey="label.operation_lbl"
            defaults="<bold>Operations</bold>"
            components={{ bold: <strong /> }}
            t={t}
          />
        </p>
        <p>
          <Trans
            i18nKey="label.operation_primarybar_tooltip"
            defaults="View and manage the <bold>operations, run, manage</bold> and <bold>end them</bold>."
            components={{ bold: <strong /> }}
            t={t}
          />
        </p>
      </PrimaryBarTooltip>
    ),
    [t],
  );

  useEffect(() => {
    if (isAdvanced) {
      addRoute({
        route: OPERATIONS_ROUTE_ID,
        position: 2,
        visible: true,
        label: t('label.operations', 'Operations') || '',
        primaryBar: 'ListOutline',
        appView: AppView,
        primarybarSection: { ...logAndQueuesSection },
        tooltip: OperationTooltipView,
        trackerLabel: PRIMARY_BAR_OPERATIONS,
      });
    }
  }, [OperationTooltipView, isAdvanced, logAndQueuesSection, t]);

  return null;
};

export default App;
