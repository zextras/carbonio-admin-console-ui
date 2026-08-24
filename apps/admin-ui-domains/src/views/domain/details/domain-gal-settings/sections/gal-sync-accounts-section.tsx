/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ListRow,
  Padding,
  Row,
  Table,
  Tooltip,
} from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { INTERNAL_GAL, ZIMBRA } from '../../../../../constants';
import { useCreateGalSyncAccount } from '../../../../../services/use-create-gal-sync-account';
import { useDeleteGalSyncAccount } from '../../../../../services/use-delete-gal-sync-account';
import { useReSyncGalAccount } from '../../../../../services/use-re-sync-gal-account';
import { GalServerTableheaders } from '../../../../utility/utils';
import { CreateGalsyncAccountModel } from '../../create-galsync-account-model';
import { DistroyGalsyncAccountModel } from '../../distroy-galsync-account-model';
import type { ServerGalRow } from '../utils';

type GalSyncAccountsSectionProps = {
  serverList: Array<ServerGalRow>;
  domainName: string | undefined;
};

export const GalSyncAccountsSection = ({
  serverList,
  domainName,
}: GalSyncAccountsSectionProps) => {
  const [t] = useTranslation();
  const { domainId } = useParams();

  const [serverSelection, setServerSelection] = useState<[] | [string]>([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDestroyModal, setOpenDestroyModal] = useState(false);

  const createMutation = useCreateGalSyncAccount(domainId);
  const deleteMutation = useDeleteGalSyncAccount(domainId);
  const reSyncMutation = useReSyncGalAccount();

  const selectedIndex =
    serverSelection.length > 0 ? serverList.findIndex((s) => s.id === serverSelection[0]) : -1;
  const selectedServer = selectedIndex >= 0 ? serverList[selectedIndex] : null;
  const hasGalAccount = selectedServer?.galAccount !== null && selectedServer?.galAccount !== undefined;
  const isCreateDisabled = !selectedServer || hasGalAccount;
  const isDeleteDisabled = !selectedServer || !hasGalAccount;

  function handleSelectionChange(selected: Array<string>): void {
    setServerSelection(selected.length > 0 ? [selected[0]] : []);
  }

  function handleCreate(
    accountData: {
      id?: string;
      name: string;
      galAccount?: { id: string; name: string; server: string } | null;
    },
    galDomainName: string,
  ): void {
    createMutation.mutate(
      {
        name: INTERNAL_GAL,
        domainName,
        server: accountData.name,
        account: [
          {
            by: 'name',
            _content: `${galDomainName}.${accountData.name}@${domainName}`,
          },
        ],
        type: ZIMBRA,
        a: [{ n: 'zimbraDataSourcePollingInterval', _content: '1d' }],
      },
      {
        onSuccess: () => {
          setOpenCreateModal(false);
        },
      },
    );
  }

  function handleDelete(accountData: {
    id?: string;
    name?: string;
    galAccount?: { id: string; name: string; server: string } | null;
  }): void {
    if (!accountData.galAccount?.id) return;
    deleteMutation.mutate(accountData.galAccount.id, {
      onSuccess: () => {
        setOpenDestroyModal(false);
      },
    });
  }

  function handleReSync(): void {
    const accountIdsToSync = serverList
      .map((server) => server.galAccount?.id)
      .filter((id): id is string => !!id);
    if (accountIdsToSync.length > 0) {
      reSyncMutation.mutate(accountIdsToSync);
    }
  }

  const tableRows = serverList.map((server) => ({
    id: server.id,
    columns: [
      <Tooltip placement="bottom" label={server.name} key={`name-${server.id}`}>
        <Row style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
          <ds-text as="span" color="gray0" weight="regular">
            {server.name}
          </ds-text>
        </Row>
      </Tooltip>,
      <Tooltip
        placement="bottom"
        label={server.galAccount?.name ?? '-'}
        key={`gal-${server.id}`}
      >
        <Row style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
          <ds-text as="span" color="gray0" weight="regular">
            {server.galAccount?.name ?? '-'}
          </ds-text>
        </Row>
      </Tooltip>,
    ],
    clickable: true,
  }));

  return (
    <>
      {openCreateModal && selectedServer && (
        <CreateGalsyncAccountModel
          open={openCreateModal}
          closeHandler={(): void => setOpenCreateModal(false)}
          saveHandler={handleCreate}
          accountData={selectedServer}
        />
      )}
      {openDestroyModal && selectedServer && (
        <DistroyGalsyncAccountModel
          open={openDestroyModal}
          closeHandler={(): void => setOpenDestroyModal(false)}
          saveHandler={handleDelete}
          accountData={selectedServer}
        />
      )}

      <Row
        orientation="horizontal"
        width="100%"
        background="gray6"
        mainAlignment="flex-end"
        padding={{ top: 'extralarge', right: 'large', left: 'large' }}
        style={{ gap: '1rem' }}
      >
        <Button
          type="outlined"
          label={t('label.create', 'CREATE')}
          color="primary"
          onClick={(e): void => {
            e.preventDefault();
            setOpenCreateModal(true);
          }}
          disabled={isCreateDisabled}
        />
        <Button
          type="outlined"
          label={t('label.re_sync', 'RE-SYNC')}
          color="primary"
          onClick={(e): void => {
            e.preventDefault();
            handleReSync();
          }}
        />
        <Button
          type="ghost"
          label={t('label.destroy', 'DELETE')}
          color="error"
          onClick={(e): void => {
            e.preventDefault();
            setOpenDestroyModal(true);
          }}
          disabled={isDeleteDisabled}
        />
      </Row>

      <Row padding={{ top: 'extralarge' }} width="100%">
        <Container mainAlignment="flex-start" crossAlignment="flex-start">
          <ListRow>
            <Container
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
              maxHeight="calc(100vh - 25rem)"
              minHeight="auto"
            >
              <Table
                headers={GalServerTableheaders(t)}
                rows={tableRows}
                showCheckbox={false}
                multiSelect={false}
                selectedRows={serverSelection}
                onSelectionChange={handleSelectionChange}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
            </Container>
          </ListRow>
          {tableRows.length === 0 && (
            <Container
              crossAlignment="center"
              mainAlignment="flex-start"
              style={{ marginTop: '1rem' }}
            >
              <Padding all="medium" width="30.875rem">
                <ds-text
                  as="p"
                  color="gray0"
                  overflow="break-word"
                  weight="regular"
                  size="large"
                  style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
                >
                  {t('label.empty_table', 'Empty Table')}
                </ds-text>
              </Padding>
            </Container>
          )}
        </Container>
      </Row>
    </>
  );
};
