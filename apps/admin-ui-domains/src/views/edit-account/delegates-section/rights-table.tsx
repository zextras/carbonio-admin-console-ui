/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  CustomHeaderFactory,
  HoverableRowFactory,
  Row,
  Table,
} from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { DelegateRow } from './utils';

type RightsTableProps = {
  /** Title, e.g. the original <Trans> block with the bold segment. */
  title: React.ReactNode;
  rows: Array<DelegateRow>;
  hasAny: boolean;
  /** Id of the selected row, if any (the table is controlled and single-select). */
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
  onRemove: () => void;
  onRemoveAll: () => void;
};

/** One simplified-view rights column: title, table and REMOVE / REMOVE ALL. */
export const RightsTable = ({
  title,
  rows,
  hasAny,
  selectedId,
  onSelect,
  onRemove,
  onRemoveAll,
}: RightsTableProps) => {
  const [t] = useTranslation();

  const simplifiedViewTableHeader = [
    {
      id: 'accounts',
      label: t('label.accounts_groups', 'Accounts / Groups'),
      width: '100%',
      bold: true,
    },
  ];

  return (
    <Row width="30%" mainAlignment="flex-start" height="auto">
      <Row width="100%" crossAlignment="flex-start" height="4rem" padding={{ bottom: 'large' }}>
        <ds-text as="h3" weight="light" size="large" overflow="break-word">
          {title}
        </ds-text>
      </Row>
      <Table
        rows={rows}
        headers={simplifiedViewTableHeader}
        multiSelect={false}
        selectedRows={selectedId !== undefined ? [selectedId] : []}
        onSelectionChange={(ids) => onSelect(ids[0])}
        style={{ overflow: 'auto', height: '15rem' }}
        RowFactory={HoverableRowFactory}
        HeaderFactory={CustomHeaderFactory}
      />
      <Row width="100%" padding={{ top: 'large', bottom: 'large' }} mainAlignment="space-between">
        <Row width="40%" mainAlignment="space-between">
          <Button
            type="ghost"
            label={t('account_details.remove', 'REMOVE')}
            color="error"
            disabled={!rows.some((row) => row.id === selectedId)}
            onClick={onRemove}
          />
        </Row>
        <Row width="60%" mainAlignment="space-between">
          <Button
            type="outlined"
            label={t('account_details.remove_all', 'REMOVE ALL')}
            color="error"
            disabled={!hasAny}
            onClick={onRemoveAll}
          />
        </Row>
      </Row>
    </Row>
  );
};
