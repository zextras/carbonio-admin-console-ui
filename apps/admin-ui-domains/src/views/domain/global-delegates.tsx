/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ModalOverlay,
  Paging,
  Row,
  Table,
  TrackNumberPerPage,
} from '@zextras/ui-components';
import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../assets/gardian.svg';
import { RECORD_DISPLAY_LIMIT } from '../../constants';
import {
  adminAccountListQueryKeys,
  useAdminAccountList,
} from '../../services/use-admin-account-list';
import { EditAccount } from './manange/accounts/edit-account/edit-account';

const GlobalDelegates: FC = () => {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const [defaultTab, setDefaultTab] = useState('general');
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [selectedAccount, setSelectedAccount] = useState<any>({});
  const [showEditAccountView, setShowEditAccountView] = useState<boolean>(false);
  const tableRef = useRef<HTMLTableElement>(null);

  const { data, isFetching } = useAdminAccountList(offset, limit);
  const accounts = data?.accounts ?? [];
  const totalAccount = data?.total ?? 0;

  const headers: any = useMemo(
    () => [
      {
        id: 'account',
        label: t('label.account', 'Account'),
        width: '25%',
        bold: true,
      },
      {
        id: 'type',
        label: t('label.type', 'Type'),
        width: '15%',
        bold: true,
      },
      {
        id: 'domain',
        label: t('label.domain', 'domain'),
        width: '20%',
        bold: true,
      },
      {
        id: 'description',
        label: t('label.description', 'Description'),
        width: '40%',
        bold: true,
      },
    ],
    [t],
  );

  const accountUserType = useCallback((item: any): string => {
    if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
    if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
    if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
    if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
    return 'Normal';
  }, []);

  const openDetailView = useCallback((acc: any): void => {
    setSelectedAccount(acc);
    setShowEditAccountView(true);
  }, []);

  const accountList = accounts.map((item: any) => ({
    id: item?.id,
    columns: [
      <ds-text
        as="span"
        size="small"
        key={`${item?.id}-name`}
        color="gray0"
        weight="regular"
        onClick={(): void => {
          openDetailView(item);
        }}
      >
        {item?.name || ' '}
      </ds-text>,
      <ds-text
        as="span"
        size="small"
        key={`${item?.id}-type`}
        color="gray0"
        weight="light"
        onClick={(): void => {
          openDetailView(item);
        }}
      >
        {accountUserType(item)}
      </ds-text>,
      <ds-text
        as="span"
        size="small"
        key={`${item?.id}-domain`}
        color="gray0"
        weight="light"
        onClick={(): void => {
          openDetailView(item);
        }}
      >
        {item?.name.split('@')[1] || ' '}
      </ds-text>,
      <ds-text
        as="span"
        size="small"
        weight="light"
        key={`${item?.id}-description`}
        color="gray0"
        onClick={(event: { stopPropagation: () => void }): void => {
          event.stopPropagation();
          openDetailView(item);
        }}
      >
        {item?.description || <>&nbsp;</>}
      </ds-text>,
    ],
    item,
    clickable: true,
  }));

  return (
    <Container
      padding={{ top: 'large', left: 'large', right: 'large' }}
      mainAlignment="flex-start"
      background="gray6"
    >
      <Row mainAlignment="flex-start" width="100%">
        <Container
          orientation="vertical"
          mainAlignment="space-around"
          background="gray6"
          height="3.625rem"
        >
          <Row orientation="horizontal" width="100%" mainAlignment="flex-start">
            <ds-text as="h1" size="medium" weight="bold" color="gray0">
              {t('label.administrators', 'Administrators')}
            </ds-text>
          </Row>
        </Container>
      </Row>
      <Row orientation="horizontal" width="100%" background="gray6">
        <ds-divider></ds-divider>
      </Row>
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        width="100%"
        style={{
          position: 'relative',
          overflow: 'auto',
        }}
        padding={{ top: 'small', left: 'small', right: 'small' }}
      >
        <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            <Row
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
              padding={{ bottom: 'large' }}
            >
              <ds-text as="h2" size="small" weight="bold" color="gray0">
                {t('domain.administration_rights', 'Administration Rights')}
              </ds-text>
            </Row>
            <Row
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
              style={{
                position: 'relative',
              }}
            >
              <Table
                rows={isFetching ? [] : accountList}
                headers={headers}
                showCheckbox={false}
                multiSelect={false}
                ref={tableRef}
                style={{
                  overflow: 'auto',
                  height: isFetching || accountList.length === 0 ? '50%' : '100%',
                }}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
              {isFetching && (
                <Container
                  crossAlignment="center"
                  mainAlignment="center"
                  height="auto"
                  padding={{ top: 'medium' }}
                >
                  <ds-spinner></ds-spinner>
                </Container>
              )}
              {accountList.length === 0 && !isFetching && (
                <Container orientation="column" crossAlignment="center" mainAlignment="center">
                  <Row>
                    <img src={logo} alt="logo" />
                  </Row>
                  <Row
                    padding={{ top: 'extralarge' }}
                    orientation="vertical"
                    crossAlignment="center"
                    style={{ textAlign: 'center' }}
                  >
                    <ds-text
                      as="p"
                      weight="light"
                      color="#828282"
                      size="large"
                      overflow="break-word"
                    >
                      {t('label.this_list_is_empty', 'This list is empty.')}
                    </ds-text>
                  </Row>
                  <Row
                    orientation="vertical"
                    crossAlignment="center"
                    style={{ textAlign: 'center' }}
                    padding={{ top: 'small' }}
                    width="53%"
                  >
                    <ds-text
                      as="p"
                      weight="light"
                      color="#828282"
                      size="large"
                      overflow="break-word"
                    >
                      <Trans
                        i18nKey="label.create_account_list_msg"
                        defaults="You can create a new Account by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
                        components={{ bold: <strong /> }}
                      />
                    </ds-text>
                  </Row>
                </Container>
              )}
              {accountList.length !== 0 && (
                <Container
                  style={{
                    position: 'sticky',
                    bottom: '-4rem',
                  }}
                >
                  <Container
                    orientation="horizontal"
                    mainAlignment="space-between"
                    background="gray6"
                    width="100%"
                    padding={{ right: 'extralarge' }}
                    height="auto"
                  >
                    <Container crossAlignment="flex-start">
                      <Paging totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
                    </Container>
                    <Container
                      crossAlignment="flex-end"
                      orientation="horizontal"
                      mainAlignment="flex-end"
                      padding={{ top: 'small' }}
                    >
                      <TrackNumberPerPage setPageSize={setLimit} />
                    </Container>
                  </Container>
                </Container>
              )}
              {showEditAccountView && (
                <ModalOverlay open={showEditAccountView} maxWidth="58.75rem">
                  <EditAccount
                    account={selectedAccount}
                    onClose={(): void => {
                      setShowEditAccountView(false);
                      setDefaultTab('general');
                    }}
                    onSaved={(): void => {
                      void queryClient.invalidateQueries({
                        queryKey: adminAccountListQueryKeys.all,
                      });
                    }}
                    onDeleted={(): void => {
                      void queryClient.invalidateQueries({
                        queryKey: adminAccountListQueryKeys.all,
                      });
                    }}
                    defaultTab={defaultTab}
                  />
                </ModalOverlay>
              )}
            </Row>
          </Container>
        </Row>
      </Container>
    </Container>
  );
};

export default GlobalDelegates;
