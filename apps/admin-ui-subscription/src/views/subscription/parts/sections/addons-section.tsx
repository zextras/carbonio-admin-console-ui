/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type IconName } from '@zextras/ui-components';
import {
	type LicenseV1AssignedSeatItem,
	type LicenseV1SeatItem,
	useLicenseV1Info,
} from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { AddonsCardActive } from '../cards/addons-card-active';
import { AddonsCardInactive } from '../cards/addons-card-inactive';
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
    name: 'ActiveSync',
    labelKey: 'label.activesync',
    labelDefault: 'ActiveSync',
    icon: 'Sync',
    descriptionKey: 'core.subscription.activesync_description',
    descriptionDefault:
      'Enables synchronization with mobile devices and external clients, supporting enterprise mobility requirements.',
  },
  {
    name: 'MailReplica',
    labelKey: 'label.mailreplica',
    labelDefault: 'UserReplica',
    icon: 'BackupOutline',
    descriptionKey: 'core.subscription.mailreplica_description',
    descriptionDefault:
      'Provides advanced availability and redundancy options, supporting high-reliability environments and business-critical deployments.',
  },
];

function isAddOnActive(addOn: LicenseV1SeatItem | LicenseV1AssignedSeatItem): boolean {
  // Seat-capped licenses (regular/perpetual): a positive capacity means active.
  // Metered/isp add-ons carry no totalSeats: their activity comes from the status.
  return 'totalSeats' in addOn ? addOn.totalSeats > 0 : addOn.status !== 'not active';
}

export const AddonsSection = () => {
  const { t } = useTranslation();
  const { data: license } = useLicenseV1Info();

  const addOnsData = license?.addOns ?? [];

  const presentAddons: Array<AddonDisplayConfig> = ADDON_CONFIGS.map((config) => ({
    ...config,
    active: addOnsData.some((addOn) => addOn.name === config.name && isAddOnActive(addOn)),
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
        {presentAddons.map((config) =>
          config.active ? (
            <AddonsCardActive key={config.name} config={config} addOns={addOnsData} />
          ) : (
            <AddonsCardInactive key={config.name} config={config} />
          ),
        )}
      </div>
    </div>
  );
};
