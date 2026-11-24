/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type IconName } from '@zextras/ui-components';
import { useLicenseV1Info } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { BundleCardActive } from '../cards/bundle-card-active';
import { BundleCardInactive } from '../cards/bundle-card-inactive';
import styles from './sections.module.css';

export type BundleDisplayConfig = {
  name: string;
  labelKey: string;
  labelDefault: string;
  icon: IconName;
  descriptionKey: string;
  descriptionDefault: string;
  active?: boolean;
};

const BUNDLE_CONFIGS: Array<BundleDisplayConfig> = [
  {
    name: 'Email',
    labelKey: 'label.email',
    labelDefault: 'Email',
    icon: 'EmailOutline',
    descriptionKey: 'core.subscription.bundle_email_description',
    descriptionDefault: 'Core communication and productivity tools',
  },
  {
    name: 'Files',
    labelKey: 'label.files_docs',
    labelDefault: 'Files & Docs',
    icon: 'FolderOutline',
    descriptionKey: 'core.subscription.bundle_files_description',
    descriptionDefault: 'Documents storage and collaboration',
  },
  {
    name: 'Chats',
    labelKey: 'label.chats_video',
    labelDefault: 'Chats & Video',
    icon: 'ChatsVideo',
    descriptionKey: 'core.subscription.bundle_chats_description',
    descriptionDefault: 'Team messaging, video calls and recordings',
  },
];

export const BundlesSection = () => {
  const { t } = useTranslation();
  const { data: license } = useLicenseV1Info();

  const bundlesData =
    license && (license.licenseType === 'metered' || license.licenseType === 'isp')
      ? license.bundles
      : [];

  const bundles: Array<BundleDisplayConfig> = BUNDLE_CONFIGS.map((config) => ({
    ...config,
    active: bundlesData.some((bundle) => bundle.name === config.name),
  }));

  return (
    <div className={styles.sectionWrapper}>
      <div className="pb-xl">
        <ds-text weight="bold" size="large">
          {t('core.subscription.feature_bundles', 'Feature bundles')}
        </ds-text>
        <ds-text size="small" style={{ display: 'block', marginTop: '0.25rem' }}>
          {t(
            'core.subscription.feature_bundles_description',
            'Combinable modules activated per account - billed on usage',
          )}
        </ds-text>
      </div>
      <div className={styles.editionGrid}>
        {bundles.map((config) =>
          config.active ? (
            <BundleCardActive key={config.name} config={config} />
          ) : (
            <BundleCardInactive key={config.name} config={config} />
          ),
        )}
      </div>
    </div>
  );
};
