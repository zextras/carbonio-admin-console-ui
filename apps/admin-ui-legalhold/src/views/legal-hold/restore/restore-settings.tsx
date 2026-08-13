/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, DatePicker, Input, LabeledValue, Switch } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { BackupAccountItem } from '../../../../types';

type RestoreSettingsProps = {
  legalHoldAccount: BackupAccountItem | null;
  account: string;
  legalHoldPrefix: string;
  fromDate: Date | null;
  undeleteFromDate: Date | null;
  unDelete: boolean;
  onPrefixChange: (value: string) => void;
  onFromDateChange: (date: Date | null) => void;
  onUndeleteFromDateChange: (date: Date | null) => void;
  onToggleUnDelete: () => void;
};

export const RestoreSettings = ({
  legalHoldAccount,
  account,
  legalHoldPrefix,
  fromDate,
  undeleteFromDate,
  unDelete,
  onPrefixChange,
  onFromDateChange,
  onUndeleteFromDateChange,
  onToggleUnDelete,
}: RestoreSettingsProps) => {
  const [t] = useTranslation();

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'large' }}
      >
        <ds-text as="span" size="small" overflow="ellipsis" weight="bold">
          {t('legal_hold.restore_settings', 'Restore Settings')}
        </ds-text>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'large', top: 'large' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <Input
            label={t('legal_hold.legalhold_prefix', 'Legal Hold prefix')}
            backgroundColor="gray5"
            value={legalHoldPrefix}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              onPrefixChange(e.target.value);
            }}
          />
        </Container>
        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <LabeledValue
            label={t('label.account', 'Account')}
            backgroundColor="gray5"
            value={account}
          />
        </Container>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <DatePicker
            label={t('label.account_status_on ', 'Account status on')}
            onChange={onFromDateChange}
            dateFormat="dd/MM/yyyy"
            minDate={new Date(legalHoldAccount?.creationTimestamp ?? '')}
            maxDate={
              legalHoldAccount?.deletedTimestamp
                ? new Date(legalHoldAccount.deletedTimestamp)
                : new Date()
            }
          />
        </Container>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <Switch
            label={t('legal_hold.include_items_deleted', 'Include items deleted')}
            value={unDelete}
            onClick={onToggleUnDelete}
            iconColor="primary"
          />
        </Container>
      </Container>
      {unDelete && (
        <Container
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          padding={{ bottom: 'extralarge' }}
          height="auto"
        >
          <Container crossAlignment="flex-start">
            <DatePicker
              isClearable
              label={t('label.include_items_deleted_after', 'Include items deleted after')}
              onChange={onUndeleteFromDateChange}
              dateFormat="dd/MM/yyyy"
              selected={undeleteFromDate}
              minDate={new Date(legalHoldAccount?.creationTimestamp ?? '')}
              maxDate={fromDate ?? new Date()}
            />
          </Container>
        </Container>
      )}
    </>
  );
};
