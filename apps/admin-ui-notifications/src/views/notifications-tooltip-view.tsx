/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { Trans, useTranslation } from 'react-i18next';

export const NotificationsTooltipView = () => {
  const [t] = useTranslation();
  return (
    <PrimaryBarTooltip>
      <p>
        <Trans
          i18nKey="label.notification_lbl"
          defaults="<bold>Notifications</bold>"
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
      <p>
        <Trans
          i18nKey="label.notification_primarybar_tooltip"
          defaults="View your <bold>notifications</bold>, mark them as <bold>read</bold> or <bold>copy</bold> to share them."
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
    </PrimaryBarTooltip>
  );
};
