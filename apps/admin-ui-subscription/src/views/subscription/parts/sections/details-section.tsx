/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Tooltip } from '@zextras/ui-components';
import { useLicenseInfo } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DATE_FORMAT } from '../../constants';
import styles from './sections.module.css';

export const DetailsSection = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const { data: licenseData } = useLicenseInfo();
  const pillRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const response = licenseData?.response;

  const handleCopy = async () => {
    if (!response?.infrastructureId) return;
    try {
      await navigator.clipboard.writeText(response.infrastructureId);
      pillRef.current?.showPopover();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        pillRef.current?.hidePopover();
      }, 3000);
    } catch {
      pillRef.current?.hidePopover();
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!response) return null;

  const isPerpetualSubscription = response.subType === 'PERPETUAL';

  const subscriptionType = response.subType
    ? response.subType.charAt(0) + response.subType.slice(1).toLowerCase()
    : '';

  const copyTooltipLabel = t('label.copy_to_clipboard', 'Copy to clipboard');

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
              {response.infrastructureId && (
                <Tooltip label={copyTooltipLabel}>
                  <button
                    type="button"
                    className={styles.copyInlineButton}
                    onClick={handleCopy}
                    aria-label={t('label.copy', 'Copy')}
                  >
                    <ds-icon icon="Copy" size="1.5rem" color="primary" />
                  </button>
                </Tooltip>
              )}
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
      <div
        popover="manual"
        ref={pillRef}
        className={styles.copyPill}
        role="status"
        aria-live="polite"
      >
        <span className={styles.copyPillInner}>
          <ds-icon icon="CheckmarkOutline" size="small" color="success" />
          <ds-text size="small">
            {t('label.copied_to_clipboard', 'Copied to clipboard')}
          </ds-text>
        </span>
      </div>
    </div>
  );
};
