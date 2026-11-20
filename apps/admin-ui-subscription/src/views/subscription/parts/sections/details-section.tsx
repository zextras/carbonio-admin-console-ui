/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CopyToClipboardButton, Tooltip } from '@zextras/ui-components';
import { useLicenseV1Info } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DATE_FORMAT } from '../../constants';
import styles from './sections.module.css';

export const DetailsSection = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const { data: license } = useLicenseV1Info();

  if (!license) return null;

  const subscriptionType =
    license.licenseType.charAt(0).toUpperCase() + license.licenseType.slice(1).toLowerCase();

  return (
    <div className={`${styles.sectionWrapper} ${styles.detailsSection}`}>
      <button
        type="button"
        className={styles.detailsToggle}
        onClick={(): void => setOpen((prev) => !prev)}
      >
        <ds-icon icon={open ? 'ChevronUp' : 'ChevronDown'} size="1rem" />
        <ds-text weight="bold" color="gray0">
          {t('label.details', 'Details')}
        </ds-text>
      </button>
      {open && (
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.company_name', 'Company Name')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{license.companyName ?? ''}</ds-text>
            </div>
          </div>

          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.partner', 'Partner')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{license.partner ?? ''}</ds-text>
            </div>
          </div>

          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.orderId', 'Order ID')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{license.orderId ?? ''}</ds-text>
              {license.orderId && <CopyToClipboardButton value={license.orderId} />}
            </div>
          </div>

          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.version', 'Module version')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{license.carbonioVersion ?? ''}</ds-text>
            </div>
          </div>

          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.subscriptionType', 'Subscription type')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{subscriptionType}</ds-text>
            </div>
          </div>

          <div className={styles.detailItem}>
            <div className={styles.labelWithIcon}>
              <ds-text size="small" className={styles.detailLabel}>
                {t('core.subscription.totalActiveAccounts', 'Total active accounts')}
              </ds-text>
              <Tooltip
                placement="top"
                label={t(
                  'core.subscription.totalActiveAccountsTooltip',
                  'System accounts, distribution lists, external or guest, closed or inactive accounts are excluded from this count.',
                )}
              >
                <ds-icon icon="InfoOutline" size="medium" color="gray0" />
              </Tooltip>
            </div>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{`${license.totalActiveAccountsNumber ?? 0}`}</ds-text>
            </div>
          </div>

          {license.licenseType === 'perpetual' && license.maintenanceEndDate && (
            <div className={styles.detailItem}>
              <ds-text size="small" className={styles.detailLabel}>
                {t('core.subscription.maintenance_end_date', 'Maintenance expiration date')}
              </ds-text>
              <div className={styles.detailValueRow}>
                <ds-text className={styles.detailValue}>
                  {format(license.maintenanceEndDate, DATE_FORMAT)}
                </ds-text>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
