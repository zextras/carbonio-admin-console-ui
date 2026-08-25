/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, LabeledValue, ListRow, Modal, Row } from '@zextras/ui-components';
import { useAllConfig } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { QuarantineAccountData } from '../../../services/use-quarantine-account';
import { useRecreateQuarantineAccount } from '../../../services/use-quarantine-message-actions';

const TIME_ITEMS = [
  { labelKey: 'label.seconds', labelDefault: 'Seconds', value: 's' },
  { labelKey: 'label.minutes', labelDefault: 'Minutes', value: 'm' },
  { labelKey: 'label.hours', labelDefault: 'Hours', value: 'h' },
  { labelKey: 'label.days', labelDefault: 'Days', value: 'd' },
] as const;

type QuarantineAccountSectionProps = {
  account: QuarantineAccountData | undefined;
};

export const QuarantineAccountSection = ({ account }: QuarantineAccountSectionProps) => {
  const [t] = useTranslation();
  const [isRecreateModalOpen, setIsRecreateModalOpen] = useState(false);
  const { data: config = [] } = useAllConfig();
  const defaultDomainName = find(config, { n: 'zimbraDefaultDomainName' })?._content ?? '';
  const recreateMutation = useRecreateQuarantineAccount();

  const onRecreate = (): void => {
    setIsRecreateModalOpen(false);
    recreateMutation.mutate({ previousAccountName: account?.name ?? '', defaultDomainName });
  };

  const onRecreateAccount = (): void => {
    recreateMutation.mutate({ previousAccountName: '', defaultDomainName });
  };

  const intervalLabel = (interval: string): string => {
    if (!interval) return '';
    const item = TIME_ITEMS.find((i) => i.value === interval);
    return item ? t(item.labelKey, item.labelDefault) : interval;
  };

  return (
    <>
      {account?.name ? (
        <>
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
            <Row width="100%" mainAlignment="space-between">
              <LabeledValue
                label={t('quarantine.quarantine_account', 'Quarantine Account')}
                value={account?.name}
              />
            </Row>
          </Row>
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
            <Button
              type="outlined"
              label={t(
                'quarantine.delete_and_recreate_quarantine',
                'DELETE AND RE-CREATE QUARANTINE ACCOUNT',
              )}
              color="error"
              width="fill"
              onClick={(): void => {
                setIsRecreateModalOpen(true);
              }}
            />
          </Row>
          <Row padding={{ top: 'small' }} width="100%" mainAlignment="center">
            <ds-text as="small" size="small" color={'gray1'}>
              {t(
                'quarantine.to_make_changes_restart_the_MTA',
                'To make the changes effective, please restart the MTA.',
              )}
            </ds-text>
          </Row>
          <Row
            padding={{ top: 'large' }}
            orientation="horizontal"
            width="100%"
            background="gray6"
          >
            <ds-divider></ds-divider>
          </Row>
          <Row orientation="horizontal" width="100%" padding={{ vertical: 'large' }}>
            <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
              <ds-text as="h2" size="medium" weight="bold" color="gray0">
                {t('label.settings', 'Settings')}
              </ds-text>
            </Row>
          </Row>
          <ListRow>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              orientation="horizontal"
              padding={{ right: 'small', bottom: 'small' }}
              width="79%"
            >
              <LabeledValue
                label={t('label.retention_period', 'Retention Period (value)')}
                backgroundColor="gray5"
                value={account?.retentionValue}
                style={{ pointerEvents: 'none' }}
              />
            </Container>
            <Container
              padding={{ bottom: 'small' }}
              mainAlignment="flex-start"
              orientation="horizontal"
              width="20%"
            >
              <LabeledValue
                label={t('label.interval', 'Interval')}
                backgroundColor="gray5"
                value={intervalLabel(account?.retentionInterval ?? '')}
              />
            </Container>
          </ListRow>
        </>
      ) : (
        <>
          <Row>
            <ds-text as="p" size="small">
              {t(
                'quarantine.not_quarantine_account',
                'There is not quarantine account in any of the domains, yet. Do you want to create a system quarantine account?',
              )}
            </ds-text>
          </Row>
          <Row width="100%" padding={{ top: 'large' }}>
            <Button
              type="outlined"
              label={t('quarantine.create_quarantine', 'CREATE A QUARANTINE ACCOUNT')}
              color="primary"
              width="fill"
              onClick={(): void => {
                onRecreateAccount();
              }}
            />
          </Row>
        </>
      )}
      <Modal
        size="medium"
        title={`${t(
          'quarantine.delete_and_recrate_quarantine_account_title',
          'Delete and re-create quarantine account',
        )}`}
        open={isRecreateModalOpen}
        customFooter={
          <Container orientation="horizontal" mainAlignment="flex-end">
            <Row style={{ gap: '0.5rem' }} padding={{ right: 'medium' }}>
              <Button
                label={t('label.keep_it_button', 'NO, KEEP IT')}
                color="primary"
                type="outlined"
                onClick={(): void => setIsRecreateModalOpen(false)}
              />
              <Button
                label={t(
                  'quarantine.destroy_account_recreate_button',
                  'YES, DELETE AND RE-CREATE IT',
                )}
                color="error"
                type="outlined"
                onClick={(): void => {
                  onRecreate();
                }}
              />
            </Row>
          </Container>
        }
        showCloseIcon
        onClose={(): void => setIsRecreateModalOpen(false)}
      >
        <ds-text
          as="p"
          size={'extralarge'}
          overflow="break-word"
          style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
        >
          {t(
            'quarantine.delete_and_recrate_quarantine_account_warning',
            `Are you sure you want to delete and re-create quarantine account?`,
          )}
        </ds-text>
      </Modal>
    </>
  );
};
