/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { LabeledValue } from '@zextras/ui-components';
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
        <button type="button" className={styles.copyButton} onClick={handleCopy}>
          <ds-icon icon="Copy" size="1rem" />
        </button>
      );
    }
    return CopyIconButton;
  }, [handleCopy]);

  if (!response) return null;

  const subscriptionType = response.subType
    ? response.subType.charAt(0) + response.subType.slice(1).toLowerCase()
    : '';

  return (
    <div className={styles.sectionWrapper}>
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
          <LabeledValue
            label={t('core.subscription.company_name', 'Company Name')}
            value={response.endUser ?? ''}
          />
          <LabeledValue
            label={t('core.subscription.partner', 'Partner')}
            value={response.customer ?? ''}
          />
          <div className={styles.copyFieldWrapper}>
            <LabeledValue
              label={t('core.subscription.order_id', 'Order ID')}
              value={response.infrastructureId ?? ''}
              CustomIcon={response.infrastructureId ? CopyIcon : undefined}
            />
          </div>
          <LabeledValue
            label={t('core.subscription.version', 'Module version')}
            value={version ?? ''}
          />
          <LabeledValue
            label={t('core.subscription.type', 'Subscription type')}
            value={subscriptionType}
          />
          <LabeledValue
            label={t('core.subscription.accounts', 'Total account')}
            value={`${response.accountCount ?? 0}/${response.licensedUsers ?? 0}`}
          />
          {response.maintenanceEndDate && (
            <LabeledValue
              label={t('core.subscription.maintenance_end_date', 'Maintenance expiration date')}
              value={format(response.maintenanceEndDate, DATE_FORMAT)}
            />
          )}
        </div>
      )}
    </div>
  );
};
