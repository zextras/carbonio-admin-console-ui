/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLicenseInfo, useVersion } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DATE_FORMAT } from '../../constants';
import styles from './sections.module.css';

export const DetailsSection = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const { data: licenseData } = useLicenseInfo();
  const { data: version } = useVersion();

  const response = licenseData?.response;

  const handleCopy = useCallback((): void => {
    if (response?.infrastructureId) {
      void navigator.clipboard.writeText(response.infrastructureId);
    }
  }, [response?.infrastructureId]);

  const CopyIcon = useMemo(() => {
    function CopyIconButton() {
      return (
        <button
          type="button"
          className={styles.copyInlineButton}
          onClick={handleCopy}
          aria-label={t('label.copy', 'Copy')}
        >
          <ds-icon icon="Copy" size="1.5rem" color="primary" />
        </button>
      );
    }
    return CopyIconButton;
  }, [handleCopy, t]);

  if (!response) return null;

  const isPerpetualSubscription = response.subType === 'PERPETUAL';

  const subscriptionType = response.subType
    ? response.subType.charAt(0) + response.subType.slice(1).toLowerCase()
    : '';

  return (
    <div className={`${styles.sectionWrapper} ${styles.detailsSection}`}>
      <div
        className={styles.detailsToggle}
        onClick={(): void => setOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e): void => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((prev) => !prev);
        }}
      >
        <ds-icon icon={open ? 'ChevronUp' : 'ChevronDown'} size="1rem" />
        <ds-text weight="bold" color="gray0">
          {t('label.details', 'Details')}
        </ds-text>
      </div>
      {open && (
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.company_name', 'Company Name')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{response.endUser ?? ''}</ds-text>
            </div>
          </div>

          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.partner', 'Partner')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{response.customer ?? ''}</ds-text>
            </div>
          </div>

          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.orderId', 'Order ID')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{response.infrastructureId ?? ''}</ds-text>
              {response.infrastructureId && <CopyIcon />}
            </div>
          </div>

          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.version', 'Module version')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{response.carbonioVersion ?? ''}</ds-text>
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
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.totalActiveAccounts', 'Total active accounts')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{`${response.accountCount ?? 0}`}</ds-text>
            </div>
          </div>

          {isPerpetualSubscription && response.maintenanceEndDate && (
            <div className={styles.detailItem}>
              <ds-text size="small" className={styles.detailLabel}>
                {t('core.subscription.maintenance_end_date', 'Maintenance expiration date')}
              </ds-text>
              <div className={styles.detailValueRow}>
                <ds-text className={styles.detailValue}>
                  {format(response.maintenanceEndDate, DATE_FORMAT)}
                </ds-text>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
