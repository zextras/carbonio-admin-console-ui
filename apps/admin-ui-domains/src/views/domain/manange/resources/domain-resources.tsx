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
  Input,
  Padding,
  Paging,
  Row,
  Table,
  TrackNumberPerPage,
} from '@zextras/ui-components';
import { format, parse } from 'date-fns';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../../assets/gardian.svg';
import { ASC, DESC, RECORD_DISPLAY_LIMIT } from '../../../../constants';
import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import { useCalResourceList } from '../../../../services/use-cal-resource';
import ScrollContainer from '../../../components/scrollComponent';
import { CreateResource } from './create-resource';
import { ResourceEditDetailView } from './resource-edit-detail-view';

type ResourceEntry = {
  id: string;
  name: string;
  a: Array<{ n: string; _content: string }>;
};

type ResourceAttr = ResourceEntry['a'][number];

function getAttr(attrs: Array<ResourceAttr> | undefined, name: string): string | undefined {
  return attrs?.find((a) => a.n === name)?._content;
}

function formatLastAccess(timestamp: string | undefined, neverLabel: string): string {
  if (!timestamp) return neverLabel;
  return format(parse(timestamp, 'yyyyMMddHHmmss.SSSX', new Date()), 'yy/MM/dd | hh:mm');
}

type ResourceTableCellProps = {
  onActivate: (detail: number) => void;
  children: React.ReactNode;
};

/** Module-level cell so table rows do not define components inside DomainResources (S6478). */
function ResourceTableCell({ onActivate, children }: Readonly<ResourceTableCellProps>) {
  return (
    <Container
      crossAlignment="flex-start"
      onClick={(e: { stopPropagation: () => void; detail: number }) => {
        e.stopPropagation();
        onActivate(e.detail);
      }}
    >
      <ds-text as="span" size="small" weight="light" color="gray0">
        {children}
      </ds-text>
    </Container>
  );
}

const SearchFunnelIcon = (): React.ReactElement => (
  <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
);

function buildStatusFilter(selectedItems: Array<{ value: string }>): string {
  if (!selectedItems || selectedItems.length === 0) return '';
  if (selectedItems.length === 1) return selectedItems[0].value;
  return `(|${selectedItems.map((i) => i.value).join('')})`;
}

function buildSearchQuery(searchStr: string, statusFilter: string): string {
  let filterQuery = '';
  if (statusFilter) filterQuery += statusFilter;
  if (searchStr) {
    filterQuery += `(|(mail=*${searchStr}*)(cn=*${searchStr}*)(sn=*${searchStr}*)(gn=*${searchStr}*)(displayName=*${searchStr}*)(zimbraMailDeliveryAddress=*${searchStr}*))`;
  }
  if (statusFilter && searchStr) return `(&${filterQuery})`;
  return filterQuery;
}

export const DomainResources = () => {
  const [t] = useTranslation();
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const [searchString, setSearchString] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<ResourceEntry | null>(null);
  const [showEditView, setShowEditView] = useState<boolean>(false);
  const [showCreateView, setShowCreateView] = useState<boolean>(false);
  const [sortedColumn, setSortedColumn] = useState<string>('displayName');
  const [sortOrder, setSortOrder] = useState<typeof ASC | typeof DESC>(ASC);
  const [isTableTooTall] = useState(false);

  const searchQuery = buildSearchQuery(searchString, statusFilter);

  const { data, isFetching } = useCalResourceList({
    domainName,
    query: searchQuery,
    sortBy: sortedColumn,
    sortOrder,
    offset,
    limit,
  });

  const resourceList: Array<ResourceEntry> = data?.calresource ?? [];
  const totalAccount: number = data?.searchTotal ?? 0;

  const resourceStatusFilter = [
    { label: t('label.active', 'Active'), value: '(&(zimbraAccountStatus=active))' },
    { label: t('label.closed', 'Closed'), value: '(&(zimbraAccountStatus=closed))' },
  ];

  const headers = [
    {
      id: 'displayName',
      label: t('label.resource', 'Resource'),
      width: '15%',
      bold: true,
      sortable: true,
      onSortChange: (id: string, order: typeof ASC | typeof DESC): void => {
        setSortOrder(order);
        setSortedColumn(id);
      },
    },
    {
      id: 'name',
      label: t('label.email', 'Email'),
      width: '25%',
      bold: true,
      sortable: true,
      onSortChange: (id: string, order: typeof ASC | typeof DESC): void => {
        setSortOrder(order);
        setSortedColumn(id);
      },
    },
    {
      id: 'status',
      label: t('label.status', 'Status'),
      width: '10%',
      i18nAllLabel: t('label.all', 'All'),
      bold: true,
      items: resourceStatusFilter,
      onChange: (e: Array<{ value: string }>) => {
        setStatusFilter(buildStatusFilter(e));
      },
    },
    {
      id: 'last_access',
      label: t('label.last_access', 'Last Access'),
      width: '15%',
      bold: true,
    },
    {
      id: 'description',
      label: t('label.description', 'Description'),
      width: '35%',
      bold: true,
    },
  ];

  let clickTimer: ReturnType<typeof setTimeout> | undefined;

  function handleRowClick(item: ResourceEntry, detail: number): void {
    clearTimeout(clickTimer);
    if (detail === 2) {
      setSelectedResource(item);
      setShowEditView(true);
    } else {
      clickTimer = setTimeout(() => {
        setSelectedResource(item);
        setShowEditView(true);
      }, 300);
    }
  }

  const neverLoggedIn = t('label.never_logged_in', 'Never logged In');

  const tableRows = resourceList.map((item) => {
    const onActivate = (detail: number): void => {
      handleRowClick(item, detail);
    };
    return {
      id: item.id,
      columns: [
        <ResourceTableCell key={`dn-${item.id}`} onActivate={onActivate}>
          {getAttr(item.a, 'displayName')}
        </ResourceTableCell>,
        <ResourceTableCell key={`nm-${item.id}`} onActivate={onActivate}>
          {item.name}
        </ResourceTableCell>,
        <ResourceTableCell key={`st-${item.id}`} onActivate={onActivate}>
          {getAttr(item.a, 'zimbraAccountStatus')}
        </ResourceTableCell>,
        <ResourceTableCell key={`la-${item.id}`} onActivate={onActivate}>
          {formatLastAccess(getAttr(item.a, 'zimbraLastLogonTimestamp'), neverLoggedIn)}
        </ResourceTableCell>,
        <ResourceTableCell key={`desc-${item.id}`} onActivate={onActivate}>
          {getAttr(item.a, 'description')}
        </ResourceTableCell>,
      ],
      item,
      clickable: true,
    };
  });

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
                {t('label.resources', 'Resources')}
              </ds-text>
            </Row>
            <Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
              <Padding all={'0'}>
                <Button
                  color="primary"
                  icon="Plus"
                  aria-label={t('label.create_resource', 'Create resource')}
                  onClick={() => setShowCreateView(true)}
                />
              </Padding>
            </Row>
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
        style={{ position: 'relative', overflow: 'auto' }}
      >
        <Row
          mainAlignment="flex-start"
          width="100%"
          padding={{ top: 'small', left: 'small', right: 'small' }}
        >
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            <Row
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
              padding={{ bottom: 'large' }}
            >
              <Container>
                <Input
                  disabled={resourceList.length === 0 && searchString.length === 0}
                  backgroundColor="gray5"
                  label={t('label.search_dot', 'Search…')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchString(e.target.value)}
                  CustomIcon={SearchFunnelIcon}
                />
              </Container>
            </Row>

            <Row
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
            >
              <Table
                rows={isFetching ? [] : tableRows}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                headers={headers as any}
                showCheckbox
                style={{
                  overflow: 'auto',
                  height: isFetching || resourceList.length === 0 ? '50%' : '100%',
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
              {resourceList.length === 0 && !isFetching && (
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
                        i18nKey="label.create_resource_msg"
                        defaults="You can create a new resource by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
                        components={{ bold: <strong /> }}
                      />
                    </ds-text>
                  </Row>
                </Container>
              )}
            </Row>

            {resourceList.length > 0 && (
              <Container
                style={{
                  position: 'sticky',
                  bottom: isTableTooTall ? '0' : '-4rem',
                }}
              >
                <ScrollContainer isVisible={isTableTooTall} />
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
          </Container>
        </Row>
      </Container>
      {showEditView && selectedResource && (
        <ResourceEditDetailView
          selectedResource={selectedResource}
          onClose={() => setShowEditView(false)}
        />
      )}
      {showCreateView && (
        <CreateResource onClose={() => setShowCreateView(false)} />
      )}
    </Container>
  );
};

export default DomainResources;
