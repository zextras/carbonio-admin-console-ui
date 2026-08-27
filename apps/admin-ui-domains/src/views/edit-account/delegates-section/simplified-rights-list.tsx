/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, useSnackbar } from '@zextras/ui-components';
import { filter, findIndex } from 'lodash-es';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useBatchDelegates } from '../../../services/use-batch-delegates';
import { useAccountForm } from '../account-form-context';
import { RightsTable } from './rights-table';
import {
  buildDelegateRows,
  buildSimplifiedRevokeBatch,
  type DelegateRightsType,
  selectDelegatesForRemoval,
} from './utils';

type SimplifiedRightsListProps = {
  identitiesList: Array<any>;
  identityRows: ReturnType<typeof buildDelegateRows>;
  refetchGrants: () => void;
};

export const SimplifiedRightsList = ({
  identitiesList,
  identityRows,
  refetchGrants,
}: SimplifiedRightsListProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { form } = useAccountForm();
  const accountDetail = useSelector(form.store, (s) => s.values as Record<string, any>);

  const [readWriteSelectedRows, setReadWriteSelectedRows] = useState<Array<string>>([]);
  const [readSelectedRows, setReadSelectedRows] = useState<Array<string>>([]);
  const [sendSelectedRows, setSendSelectedRows] = useState<Array<string>>([]);

  const batchDelegates = useBatchDelegates(accountDetail?.zimbraId);

  const readWriteRows = filter(identityRows, { writeFolder: true, readFolder: true });
  const readRows = filter(identityRows, { writeFolder: false, readFolder: true });
  const sendRows = filter(identityRows, { sendRights: true });

  const handleSimpleDeleteDelegate = (single: boolean, rightsType: DelegateRightsType): void => {
    const selectedRowsByType: Record<DelegateRightsType, Array<string>> = {
      readWrite: readWriteSelectedRows,
      read: readSelectedRows,
      send: sendSelectedRows,
    };
    const selectedRowId = selectedRowsByType[rightsType][0];
    const selectedDelegateArr = selectDelegatesForRemoval(
      rightsType,
      single,
      selectedRowId,
      identitiesList,
      identityRows,
    );
    if (rightsType === 'readWrite') {
      setReadWriteSelectedRows([]);
    } else if (rightsType === 'read') {
      setReadSelectedRows([]);
    } else if (rightsType === 'send') {
      setSendSelectedRows([]);
    }

    const { revokeUsrRigths, folderUsrRights } = buildSimplifiedRevokeBatch(
      selectedDelegateArr,
      rightsType,
      accountDetail?.zimbraMailDeliveryAddress,
    );

    if (revokeUsrRigths.length > 0 || folderUsrRights.length > 0) {
      batchDelegates.mutate(
        {
          reqObject: {
            RevokeRightRequest: revokeUsrRigths,
            FolderActionRequest: folderUsrRights,
            _jsns: 'urn:zimbra',
          },
          otherAccount: accountDetail?.zimbraMailDeliveryAddress,
        },
        {
          onSettled: (): void => {
            refetchGrants();
          },
        },
      );

      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('account_details.delegate_deleted_successfully', 'Delegate deleted successfully'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  };

  return (
    <Container mainAlignment="flex-start" height="auto" width={'100%'} padding={{ bottom: '3rem' }}>
      <Container
        width="100%"
        padding={{ top: 'large', left: 'large' }}
        mainAlignment="space-between"
        crossAlignment="flex-start"
        height="auto"
        orientation="horizontal"
      >
        <RightsTable
          title={
            <Trans
              i18nKey="account_details.account_with_read_write_rights"
              defaults="Accounts with <bold>Read/Write</bold> rights"
              components={{ bold: <strong /> }}
            />
          }
          rows={readWriteRows}
          hasAny={findIndex(identityRows, { writeFolder: true, readFolder: true }) >= 0}
          selected={readWriteSelectedRows}
          onSelectionChange={setReadWriteSelectedRows}
          onRemove={(): void => handleSimpleDeleteDelegate(true, 'readWrite')}
          onRemoveAll={(): void => handleSimpleDeleteDelegate(false, 'readWrite')}
        />
        <RightsTable
          title={
            <Trans
              i18nKey="account_details.account_with_read_only_rights"
              defaults="Accounts with <bold>Read Only</bold> rights"
              components={{ bold: <strong /> }}
            />
          }
          rows={readRows}
          hasAny={findIndex(identityRows, { writeFolder: false, readFolder: true }) >= 0}
          selected={readSelectedRows}
          onSelectionChange={setReadSelectedRows}
          onRemove={(): void => handleSimpleDeleteDelegate(true, 'read')}
          onRemoveAll={(): void => handleSimpleDeleteDelegate(false, 'read')}
        />
        <RightsTable
          title={
            <Trans
              i18nKey="account_details.account_with_send_rights"
              defaults="Account with <bold>SendAs/SendonBehalf</bold> rights on"
              components={{ bold: <strong /> }}
            />
          }
          rows={sendRows}
          hasAny={findIndex(identityRows, { sendRights: true }) >= 0}
          selected={sendSelectedRows}
          onSelectionChange={setSendSelectedRows}
          onRemove={(): void => handleSimpleDeleteDelegate(true, 'send')}
          onRemoveAll={(): void => handleSimpleDeleteDelegate(false, 'send')}
        />
      </Container>
    </Container>
  );
};
