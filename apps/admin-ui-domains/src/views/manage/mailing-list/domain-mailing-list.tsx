/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, ModalOverlay, Padding, Row } from '@zextras/ui-components';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import CreateMailingList from './create-mailing-list/create-mailing-list';
import { useCreateMailingListFlow } from './create-mailing-list/use-create-mailing-list-flow';
import { buildDistributionListRow } from './distribution-list-row';
import { DistributionListTable } from './distribution-list-table';
import EditDistributionList from './edit-distribution-list/edit-distribution-list';
import { useDistributionListsSearch } from './use-distribution-lists-search';

const DomainMailingList: FC = () => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;

  const {
    lists,
    totalAccount,
    isFetching,
    hasError,
    headers,
    searchString,
    setSearchString,
    setOffset,
    setLimit,
    limit,
  } = useDistributionListsSearch(domainName);

  const [selectedMailingList, setSelectedMailingList] = useState<any>({});
  const [showMailingListDetailView, setShowMailingListDetailView] = useState<any>();
  const [showCreateMailingListView, setShowCreateMailingListView] = useState<boolean>(false);
  /* timeout id holder for single/double-click detection */
  const [cellClickTimer, setCellClickTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { createList, isCreating } = useCreateMailingListFlow((): void => {
    setShowCreateMailingListView(false);
  });

  const doClickAction = (): void => {
    setShowMailingListDetailView(true);
  };

  const doDoubleClickAction = (): void => {
    setShowMailingListDetailView(true);
  };

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (cellClickTimer) {
      clearTimeout(cellClickTimer);
    }
    if (event.detail === 1) {
      setCellClickTimer(setTimeout(doClickAction, 300));
    } else if (event.detail === 2) {
      setCellClickTimer(null);
      doDoubleClickAction();
    }
  };

  const rows: Array<any> = lists.map((item: any) =>
    buildDistributionListRow(item, {
      canReceiveLabel: t('domain.mailingList.canReceive', 'Can Receive'),
      cantReceiveLabel: t('domain.mailingList.cantReceive', "Can't Receive"),
      yesLabel: t('label.yes', 'Yes'),
      noLabel: t('label.no', 'No'),
      onCellClick: (clickedItem, e): void => {
        setSelectedMailingList(clickedItem);
        handleClick(e);
      },
    }),
  );

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
          <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
            <Row mainAlignment="flex-start" width="30%" crossAlignment="flex-start">
              <ds-text as="h1" size="medium" weight="bold" color="gray0">
                {t('label.distribution_list', 'Distribution List')}
              </ds-text>
            </Row>
            <Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
              <Padding all={'0'}>
                <Button
                  color="primary"
                  icon="Plus"
                  onClick={(): void => setShowCreateMailingListView(true)}
                />
              </Padding>
            </Row>
          </Row>
        </Container>
      </Row>
      <Row orientation="horizontal" width="100%" background="gray6">
        <ds-divider />
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
        <DistributionListTable
          rows={rows}
          headers={headers}
          isFetching={isFetching}
          hasError={hasError}
          searchString={searchString}
          onSearchChange={(e): void => {
            setSearchString(e.target.value);
          }}
          totalAccount={totalAccount}
          offsetSetter={setOffset}
          pageSize={limit}
          onPageSizeChange={setLimit}
        />
      </Container>
      {showMailingListDetailView && (
        <ModalOverlay open={showMailingListDetailView} maxWidth="58.75rem">
          <EditDistributionList
            selectedMailingList={selectedMailingList}
            setShowMailingListDetailView={setShowMailingListDetailView}
          />
        </ModalOverlay>
      )}

      {showCreateMailingListView && (
        <ModalOverlay open={showCreateMailingListView} maxWidth="58.75rem">
          <CreateMailingList
            setShowCreateMailingListView={setShowCreateMailingListView}
            createList={createList}
            isLoading={isCreating}
          />
        </ModalOverlay>
      )}
    </Container>
  );
};

export default DomainMailingList;
