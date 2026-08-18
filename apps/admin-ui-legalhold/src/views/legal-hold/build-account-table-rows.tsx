/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, type TRow } from '@zextras/ui-components';
import { format } from 'date-fns';
import { TFunction } from 'i18next';

import type { BackupAccountItem } from '../../../types';
import { TRUE } from '../../constants';

type AccountCellProps = {
  value: string;
  weight?: 'light' | 'regular';
};

const AccountCell = ({ value, weight = 'light' }: AccountCellProps) => (
  <Container crossAlignment="flex-start">
    <ds-text as="span" size="small" weight={weight} color="gray0">
      {value}
    </ds-text>
  </Container>
);

export function buildAccountTableRows(
  accounts: Array<BackupAccountItem>,
  t: TFunction,
): Array<TRow> {
  return accounts.map((item) => ({
    id: `${item.id}-${item.serverName}`,
    clickable: true,
    columns: [
      <AccountCell key={`${item.id}-name`} value={item.name} />,
      <AccountCell key={`${item.id}-id`} value={item.id} />,
      <AccountCell key={`${item.id}-server`} value={item.serverName} />,
      <AccountCell
        key={`${item.id}-created`}
        value={format(item.creationTimestamp, 'dd/MM/yyyy')}
      />,
      <AccountCell
        key={`${item.id}-deleted`}
        value={item.deletedTimestamp ? format(item.deletedTimestamp, 'dd/MM/yyyy') : ''}
      />,
      <AccountCell key={`${item.id}-status`} value={item.status} weight="regular" />,
      <AccountCell
        key={`${item.id}-legal-hold`}
        value={
          item.legalHold?.toUpperCase() === TRUE ? t('legal_hold.yes', 'Yes') : t('legal_hold.no', 'No')
        }
        weight="regular"
      />,
    ],
  }));
}
