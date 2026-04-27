/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { theme } from '@zextras/ui-components';
import { useLicenseInfo } from '@zextras/ui-shared';
import { differenceInCalendarDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

import styles from './trial-banner.module.css';

export const TrialBanner = () => {
  const { data: licenseData } = useLicenseInfo();
  const dateLicenceEnd = licenseData?.response?.dateEnd;
  const { t } = useTranslation();

  const daysLeft = dateLicenceEnd
    ? Math.max(0, differenceInCalendarDays(dateLicenceEnd, new Date()))
    : 0;
  const title = t('core.subscription.trial_remaining_days', {
    count: daysLeft,
    defaultValue_one: 'Trial active — {{count}} day remaining',
    defaultValue_other: 'Trial active — {{count}} days remaining',
  });
  const subTitle = t(
    'core.subscription.contact_provider',
    'To upgrade your license, please contact your service provider.',
  );

  return (
    <div className={styles.outer}>
      <div className={styles.banner}>
        <div className={styles.iconWrapper}>
          <ds-icon icon="ClockOutline" color={theme.trial.box.color}></ds-icon>
        </div>
        <div className={styles.text}>
          <ds-text size="medium" weight="bold">
            {title}
          </ds-text>
          <ds-text className={styles.subtitle}>{subTitle}</ds-text>
        </div>
      </div>
      <div className={styles.badge}>
        <ds-text weight="bold" size="large" color={theme.trial.box.text}>
          {daysLeft}
        </ds-text>
        <ds-text size="extrasmall" color={theme.trial.box.text}>
          Days left
        </ds-text>
      </div>
    </div>
  );
};
