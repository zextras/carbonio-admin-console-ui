/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { Trans, useTranslation } from 'react-i18next';

export const LegalHoldTooltipView = () => {
  const [t] = useTranslation();

  return (
    <PrimaryBarTooltip>
      <Trans
        i18nKey="label.legal_hold_lbl"
        defaults="<bold>Legal Hold</bold>"
        components={{ bold: <strong /> }}
        t={t}
      />
    </PrimaryBarTooltip>
  );
};
