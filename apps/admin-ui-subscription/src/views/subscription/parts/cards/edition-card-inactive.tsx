/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { theme } from '@zextras/ui-components';
import { Trans, useTranslation } from 'react-i18next';

import { type EditionDisplayConfig } from '../sections/active-edition-section';
import styles from './edition-card.module.css';

type EditionCardProps = {
  config: EditionDisplayConfig;
};

export const EditionCardInactive = ({ config }: EditionCardProps) => {
  const { t } = useTranslation();
  const activeLabel = t('label.inactive', 'Inactive').toUpperCase();
  const editionLabel = t(config.labelKey, config.labelDefault).toUpperCase();

  const description = (
    <Trans
      i18nKey="core.subscription.inactive_edition_description"
      defaults="Upgrade your subscription to unlock the <bold>Workspace</bold> edition and expand your collaboration capabilities."
      components={{ bold: <strong /> }}
      t={t}
    />
  );

  return (
    <div key={config.name} className={`${styles.editionCard} ${styles.editionCardInactive}`}>
      <div className={styles.editionCardHeader}>
        <ds-icon icon={config.icon} size="1.25rem" />
        <ds-text weight="bold" size="large">
          {editionLabel}
        </ds-text>
        <ds-badge color={theme.color.gray0.disabled}>
          <ds-text size="small">{activeLabel}</ds-text>
        </ds-badge>
      </div>
      <div className={styles.statsRow}>
        <ds-text size="extrasmall" color="gray0" overflow="break-word">
          {description}
        </ds-text>
      </div>
    </div>
  );
};
