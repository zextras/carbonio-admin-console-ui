/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type IconName } from '@zextras/ui-components';
import { useLicenseInfo } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { EditionCardActive } from '../cards/edition-card-active';
import { EditionCardInactive } from '../cards/edition-card-inactive';
import styles from './sections.module.css';

export type EditionDisplayConfig = {
  name: string;
  labelKey: string;
  labelDefault: string;
  icon: IconName;
  active?: boolean;
};

const MAIN_EDITION_CONFIGS: Array<EditionDisplayConfig> = [
  { name: 'email_edition', labelKey: 'label.email', labelDefault: 'Email', icon: 'EmailOutline' },
  {
    name: 'workspace_edition',
    labelKey: 'label.workspace',
    labelDefault: 'Workspace',
    icon: 'BuildingOutline',
  },
];

export const ActiveEditionSection = () => {
  const { t } = useTranslation();
  const { data: licenseData } = useLicenseInfo();

  const editionsData = licenseData?.response?.editions ?? [];

  const mainEditions: Array<EditionDisplayConfig> = MAIN_EDITION_CONFIGS.map((config) => ({
    ...config,
    active: editionsData.some(
      (e) => e.name === config.name && e.quantity !== 'none' && e.quantity !== '0',
    ),
  }));

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <ds-text weight="bold" size="large" color="gray0">
            {t('core.subscription.active_edition_section', 'Active edition')}
          </ds-text>
          <ds-text size="small" style={{ display: 'block', marginTop: '0.25rem' }}>
            {t(
              'core.subscription.active_edition_description',
              'Here you can find information regarding your registration.',
            )}
          </ds-text>
        </div>
      </div>
      <div className={styles.editionGrid}>
        {mainEditions.map((config) =>
          config.active ? (
            <EditionCardActive key={config.name} config={config} editions={editionsData} />
          ) : (
            <EditionCardInactive key={config.name} config={config} />
          ),
        )}
      </div>
    </div>
  );
};
