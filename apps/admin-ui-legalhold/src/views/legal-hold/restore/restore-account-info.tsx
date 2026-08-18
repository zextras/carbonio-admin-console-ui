/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { BackupAccountItem } from '../../../../types';

type InfoRowProps = {
  label: string;
  value: string;
};

const InfoRow = ({ label, value }: InfoRowProps) => (
  <Container
    orientation="horizontal"
    crossAlignment="flex-start"
    mainAlignment="flex-start"
    height="auto"
    padding={{ bottom: 'small' }}
  >
    <Container crossAlignment="flex-start" width="7rem">
      <ds-text as="span" size="small" overflow="ellipsis" weight="bold">
        {label} :
      </ds-text>
    </Container>
    <Container width="20rem" crossAlignment="flex-start" padding={{ left: 'small' }}>
      <ds-text as="span" size="small" overflow="ellipsis">
        {value}
      </ds-text>
    </Container>
  </Container>
);

type RestoreAccountInfoProps = {
  legalHoldAccount: BackupAccountItem | null;
};

export const RestoreAccountInfo = ({ legalHoldAccount }: RestoreAccountInfoProps) => {
  const [t] = useTranslation();

  return (
    <>
      <InfoRow label={t('label.server', 'Server Name')} value={legalHoldAccount?.serverName ?? ''} />
      <InfoRow label={t('label.account_id', 'Account Id')} value={legalHoldAccount?.id ?? ''} />
      <InfoRow
        label={t('label.created_date', 'Created Date')}
        value={
          legalHoldAccount?.creationTimestamp
            ? format(legalHoldAccount.creationTimestamp, 'dd/MM/yyyy')
            : ''
        }
      />
      {legalHoldAccount?.deletedTimestamp && (
        <InfoRow
          label={t('label.deleted_date', 'Deleted Date')}
          value={format(legalHoldAccount.deletedTimestamp, 'dd/MM/yyyy')}
        />
      )}
    </>
  );
};
