/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { addRoute, useIsAdvanced } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { LOG_AND_QUEUES, OPERATIONS_ROUTE_ID, PRIMARY_BAR_OPERATIONS } from './constants';
import { AppView } from './views/app-view';

const OperationTooltipView = () => {
  const [t] = useTranslation();
  return (
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
  );
};

const App = () => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();

  useEffect(() => {
    if (isAdvanced) {
      addRoute({
        route: OPERATIONS_ROUTE_ID,
        position: 2,
        visible: true,
        label: t('label.operations', 'Operations') || '',
        primaryBar: 'ListOutline',
        appView: AppView,
        primarybarSection: {
          id: LOG_AND_QUEUES,
          label: t('label.long_and_queues', 'Log & Queues'),
          position: 5,
        },
        tooltip: OperationTooltipView,
        trackerLabel: PRIMARY_BAR_OPERATIONS,
      });
    }
  }, [isAdvanced, t]);

  return null;
};

export default App;
