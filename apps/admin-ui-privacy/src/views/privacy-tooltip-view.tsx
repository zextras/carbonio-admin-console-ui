/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { Trans, useTranslation } from 'react-i18next';

export function PrivacyTooltipView() {
  const [t] = useTranslation();
  return (
    <PrimaryBarTooltip>
      <p>
        <Trans
          i18nKey="label.privacy_lbl"
          defaults="<bold>Privacy</bold>"
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
      <p>
        <Trans
          i18nKey="label.privacy_primarybar_tooltip"
          defaults="Manage the <bold>Privacy</bold> settings such as <bold>data reports, error logs</bold> and <bold>surveys</bold>."
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
    </PrimaryBarTooltip>
  );
}
