/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type IconName } from '@zextras/ui-components';
import { useLicenseInfo } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { AddonsCardActive } from '../cards/addons-card-active';
import styles from './sections.module.css';

export type AddonDisplayConfig = {
  name: string;
  labelKey: string;
  labelDefault: string;
  icon: IconName;
  descriptionKey: string;
  descriptionDefault: string;
  active?: boolean;
};

const ADDON_CONFIGS: Array<AddonDisplayConfig> = [
  {
    name: 'activesync_addon',
    labelKey: 'label.activesync',
    labelDefault: 'ActiveSync',
    icon: 'Sync',
    descriptionKey: 'core.subscription.activesync_description',
    descriptionDefault:
      'Enables synchronization with mobile devices and external clients, supporting enterprise mobility requirements.',
  },
  {
    name: 'replica_addon',
    labelKey: 'label.mailreplica',
    labelDefault: 'UserReplica',
    icon: 'Copy',
    descriptionKey: 'core.subscription.mailreplica_description',
    descriptionDefault:
      'Provides advanced availability and redundancy options, supporting high-reliability environments and business-critical deployments.',
  },
];

export const AddonsSection = () => {
  const { t } = useTranslation();
  const { data: licenseData } = useLicenseInfo();

  const editionsData = licenseData?.response?.editions ?? [];

  const presentAddons: Array<AddonDisplayConfig> = ADDON_CONFIGS.map((config) => ({
    ...config,
    active: Number(editionsData.find((e) => e.name === config.name)?.quantity) > 0,
  }));

  return (
    <div className={styles.sectionWrapper}>
      <div>
        <ds-text weight="bold" size="large">
          {t('core.subscription.addons_section', 'Add-ons')}
        </ds-text>
        <ds-text size="small" style={{ display: 'block', marginTop: '0.25rem' }}>
          {t(
            'core.subscription.addons_description',
            'Optional modules assigned per account, independently from editions',
          )}
        </ds-text>
      </div>
      <div className={styles.addonsContainer}>
        {presentAddons.map((config) => (
          <AddonsCardActive key={config.name} config={config} editions={editionsData} />
        ))}
      </div>
    </div>
  );
};
