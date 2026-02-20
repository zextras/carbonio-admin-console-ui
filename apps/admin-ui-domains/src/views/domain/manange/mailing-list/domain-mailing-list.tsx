/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  ModalOverlay,
  Padding,
  Paging,
  Row,
  Table,
  Text,
  TrackNumberPerPage,
  useSnackbar,
} from '@zextras/ui-components';
import { useDomainStore } from '@zextras/ui-shared';
import { debounce } from 'lodash';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../../assets/gardian.svg';
import {
  ALL,
  ASC,
  DESC,
  EMAIL,
  FALSE,
  GRP,
  PUB,
  RECORD_DISPLAY_LIMIT,
  TRUE,
} from '../../../../constants';
import { addDistributionListMember } from '../../../../services/add-distributionlist-member-service';
import { createMailingList } from '../../../../services/create-mailing-list-service';
import { distributionListAction } from '../../../../services/distribution-list-action-service';
import { searchDirectory } from '../../../../services/search-directory-service';
import ScrollContainer from '../../../components/scrollComponent';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import CreateMailingList from './create-mailing-list';
import EditMailingListView from './edit-mailing-detail-view';

const DomainMailingList: FC = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const domainName = useDomainStore((state) => state.domain?.name);
  const [mailingList, setMailingList] = useState<any[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [totalAccount, setTotalAccount] = useState<number>(0);
  const [selectedMailingList, setSelectedMailingList] = useState<any>({});
  const [showMailingListDetailView, setShowMailingListDetailView] = useState<any>();
  const [searchString, setSearchString] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDlRow, setSelectedDlRow] = useState<any>([]);
  const [isUpdateRecord, setIsUpdateRecord] = useState<boolean>(false);
  const [showCreateMailingListView, setShowCreateMailingListView] = useState<boolean>(false);
  const timer = useRef<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [sortedColumn, setSortedColumn] = useState<string>('displayName');
  const [sortOrder, setSortOrder] = useState<typeof ASC | typeof DESC>(ASC);
  const tableRef = useRef<HTMLTableElement>(null);
  const [isTableTooTall, setIsTableTooTall] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const mailingListStatusFilter: any = useMemo(
    () => [
      {
        label: t('domain.mailingList.canReceive', 'Can Receive'),
        value: '(&(zimbraMailStatus=enabled))',
      },
      {
        label: t('domain.mailingList.cantReceive', "Can't Receive"),
        value: '(&(zimbraMailStatus=disabled))',
      },
    ],
    [t],
  );

  const headers: any[] = useMemo(
    () => [
      {
        id: 'displayName',
        label: t('label.display_name', 'DisplayName'),
        width: '20%',
        bold: true,
        sortable: true,
        onSortChange: (id: string, order: typeof ASC | typeof DESC): void => {
          setSortOrder(order);
          setSortedColumn(id);
        },
      },
      {
        id: 'name',
        label: t('label.address', 'Address'),
        width: '20%',
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
        width: '15%',
        i18nAllLabel: t('label.all', 'All'),
        bold: true,
        items: [
          { label: mailingListStatusFilter[0].label, value: mailingListStatusFilter[0].value },
          { label: mailingListStatusFilter[1].label, value: mailingListStatusFilter[1].value },
        ],

        onChange: (e: any) => {
          if (e?.length > 0) {
            let statusQuery = '';
            e.forEach((item: { value: string }) => {
              statusQuery += item.value;
            });
            if (e?.length > 1) {
              statusQuery = `(|${statusQuery})`;
            }
            setStatusFilter(statusQuery);
          } else {
            setStatusFilter('');
          }
        },
      },
      {
        id: 'dynamic',
        label: t('label.dynamic', 'Dynamic'),
        width: '7%',
        bold: true,
      },
      {
        id: 'gal',
        label: t('label.gal', 'GAL'),
        width: '7%',
        bold: true,
      },
      {
        id: 'description',
        label: t('label.description', 'Description'),
        width: '15%',
        bold: true,
      },
    ],
    [mailingListStatusFilter, t],
  );

  const doClickAction = useCallback((): void => {
    setShowMailingListDetailView(true);
  }, []);

  const doDoubleClickAction = useCallback((): void => {
    setShowMailingListDetailView(true);
  }, []);

  const handleClick = useCallback(
    (event: any) => {
      event.stopPropagation();
      clearTimeout(timer.current);
      if (event.detail === 1) {
        timer.current = setTimeout(doClickAction, 300);
      } else if (event.detail === 2) {
        doDoubleClickAction();
      }
    },
    [doClickAction, doDoubleClickAction],
  );

  const getMailingList = useCallback((): void => {
    const attrs =
      'displayName,zimbraId,zimbraMailHost,uid,description,zimbraMailStatus,zimbraHideInGal';
    const types = 'distributionlists,dynamicgroups';
    const query = `${searchQuery}(&(!(zimbraIsAdminGroup=TRUE)))`;
    setIsRequestInProgress(true);
    searchDirectory(attrs, types, domainName || '', query, offset, limit, sortedColumn, sortOrder)
      .then((data) => {
        const dlList = data?.dl;
        if (dlList) {
          if (data?.searchTotal) {
            setTotalAccount(data?.searchTotal);
          }
          const mList: any[] = [];
          dlList.forEach((item: any) => {
            mList.push({
              id: item?.id,
              columns: [
                <Container
                  crossAlignment="flex-start"
                  key={item?.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(e: { stopPropagation: () => void }): void => {
                    e.stopPropagation();
                    setSelectedMailingList(item);
                    handleClick(e);
                  }}
                >
                  <Text
                    size="small"
                    weight="regular"
                    key={`${item?.id}display-child`}
                    color="gray0"
                  >
                    {item?.a?.find((a: any) => a?.n === 'displayName')?._content}
                  </Text>
                </Container>,
                <Container
                  crossAlignment="flex-start"
                  key={`${item?.id}-address`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e: { stopPropagation: () => void }): void => {
                    e.stopPropagation();
                    setSelectedMailingList(item);
                    handleClick(e);
                  }}
                >
                  <Text size="small" weight="light" key={`${item?.id}address-child`} color="gray0">
                    {item?.name}
                  </Text>
                </Container>,
                <Container
                  crossAlignment="flex-start"
                  key={`${item?.id}-status`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e: { stopPropagation: () => void }): void => {
                    e.stopPropagation();
                    setSelectedMailingList(item);
                    handleClick(e);
                  }}
                >
                  <Text size="small" weight="light" key={`${item?.id}status-child`} color="gray0">
                    {item?.a?.find((a: any) => a?.n === 'zimbraMailStatus')?._content === 'enabled'
                      ? t('domain.mailingList.canReceive', 'Can Receive')
                      : t('domain.mailingList.cantReceive', "Can't Receive")}
                  </Text>
                </Container>,
                <Container
                  crossAlignment="flex-start"
                  key={`${item?.id}-dynamic`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e: { stopPropagation: () => void }): void => {
                    e.stopPropagation();
                    setSelectedMailingList(item);
                    handleClick(e);
                  }}
                >
                  <Text size="small" weight="light" key={`${item?.id}dynamic-child`} color="gray0">
                    {item?.dynamic ? t('label.yes', 'Yes') : t('label.no', 'No')}
                  </Text>
                </Container>,
                <Container
                  crossAlignment="flex-start"
                  key={`${item?.id}-gal`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e: { stopPropagation: () => void }): void => {
                    e.stopPropagation();
                    setSelectedMailingList(item);
                    handleClick(e);
                  }}
                >
                  <Text size="small" weight="light" key={`${item?.id}gal-child`} color="gray0">
                    {item?.a?.find((a: any) => a?.n === 'zimbraHideInGal')?._content === 'TRUE'
                      ? t('label.no', 'No')
                      : t('label.yes', 'Yes')}
                  </Text>
                </Container>,
                <Container
                  crossAlignment="flex-start"
                  key={`${item?.id}-description`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e: { stopPropagation: () => void }): void => {
                    e.stopPropagation();
                    setSelectedMailingList(item);
                    handleClick(e);
                  }}
                >
                  <Text
                    size="small"
                    weight="light"
                    key={`${item?.id}description-child`}
                    color="gray0"
                  >
                    {item?.a?.find((a: any) => a?.n === 'description')?._content}
                  </Text>
                </Container>,
              ],
            });
          });
          setMailingList(mList);
          setIsUpdateRecord(false);
        } else {
          setTotalAccount(0);
          setMailingList([]);
          setIsUpdateRecord(false);
        }
        setIsRequestInProgress(false);
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
        setIsRequestInProgress(false);
        setHasError(true);
      });
  }, [
    searchQuery,
    domainName,
    offset,
    limit,
    sortedColumn,
    sortOrder,
    t,
    handleClick,
    createSnackbar,
  ]);

  useEffect(() => {
    getMailingList();
  }, [getMailingList]);

  const generateSearchFilterQuery = useCallback((searchStr: string, sfilter: string): string => {
    let filterQuery = '';
    if (sfilter) {
      filterQuery += sfilter;
    }
    if (searchStr) {
      filterQuery += `(|(mail=*${searchStr}*)(cn=*${searchStr}*)(sn=*${searchStr}*)(gn=*${searchStr}*)(displayName=*${searchStr}*)(zimbraMailDeliveryAddress=*${searchStr}*))`;
    }
    if (sfilter && searchStr) {
      return `(&${filterQuery})`;
    }
    return filterQuery;
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchMailingListQuery = useCallback(
    debounce((searchStr: string, sfilter: string) => {
      setSearchQuery(generateSearchFilterQuery(searchStr, sfilter));
    }, 700),
    [debounce, generateSearchFilterQuery],
  );

  useEffect(() => {
    searchMailingListQuery(searchString, statusFilter);
  }, [searchString, searchMailingListQuery, statusFilter]);

  useEffect(() => {
    if (showMailingListDetailView !== undefined && !showMailingListDetailView) {
      setShowMailingListDetailView(false);
    }
  }, [showMailingListDetailView]);

  useEffect(() => {
    if (isUpdateRecord) {
      getMailingList();
    }
  }, [isUpdateRecord, getMailingList]);

  const onAddClick = useCallback(() => {
    setShowCreateMailingListView(true);
  }, []);

  const callAllRequest = useCallback(
    (requests: any): void => {
      Promise.all(requests)
        .then((response: any) => Promise.all(response.map((res: any) => res.json())))
        .then((data: any) => {
          setIsUpdateRecord(true);

          let isError = false;
          let errorMessage = '';
          data.forEach((item: any) => {
            if (item?.Body?.Fault) {
              isError = true;
              errorMessage = item?.Body?.Fault?.Reason?.Text;
            }
          });
          if (isError) {
            createSnackbar({
              key: 'error',
              severity: 'error',
              label: errorMessage,
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
          }
        })
        .catch(() => {
          setIsUpdateRecord(true);
        });
    },
    [createSnackbar],
  );

  const getOwnerType = useCallback((ownersList: any, email?: string): any => {
    let type = 'email';
    ownersList.forEach((item: any) => {
      if (item?._attrs && item?._attrs?.type && item?._attrs?.email === email) {
        type = item?._attrs?.type === 'group' ? 'grp' : 'usr';
      }
    });
    return type;
  }, []);

  const addMemberToMailingList = useCallback(
    (members: any, owners: any, mlId: string, ownersList: Array<any>): void => {
      const request: any[] = [];
      if (members.length > 0 && mlId) {
        members.forEach((item: any) => {
          const id: any = {
            n: 'id',
            _content: mlId,
          };
          const dlmItem: any = {
            n: 'dlm',
            _content: item,
          };
          request.push(addDistributionListMember(id, dlmItem));
        });
      }

      if (owners.length > 0 && mlId) {
        owners.forEach((item: any) => {
          const dl: any = {
            by: 'id',
            _content: mlId,
          };
          const action: any = {
            op: 'addOwners',
            owner: {
              by: 'name',
              type: getOwnerType(ownersList, item),
              _content: item,
            },
          };
          request.push(distributionListAction(dl, action));
        });
      }
      if (request.length > 0) {
        callAllRequest(request);
      } else {
        setIsUpdateRecord(true);
      }
    },
    [callAllRequest, getOwnerType],
  );

  const createMailingListReq = useCallback(
    (
      name: string,
      description: string,
      dynamic: boolean,
      displayName: string,
      zimbraHideInGal: boolean,
      zimbraMailStatus: boolean,
      zimbraNotes: string,
      memberURL: string,
      members: string[],
      zimbraDistributionListSendShareMessageToNewMembers: boolean,
      owners: string[],
      allOwnersList: any[],
      ownerGrantEmailType: { value: string },
      ownerGrantEmails: string[],
    ) => {
      setIsLoading(true);
      const attributes: any[] = [];
      attributes.push({
        n: 'displayName',
        _content: displayName,
      });
      attributes.push({
        n: 'zimbraNotes',
        _content: zimbraNotes,
      });
      attributes.push({
        n: 'zimbraHideInGal',
        _content: zimbraHideInGal ? TRUE : FALSE,
      });
      attributes.push({
        n: 'zimbraMailStatus',
        _content: zimbraMailStatus ? 'enabled' : 'disabled',
      });
      if (dynamic) {
        attributes.push({
          n: 'zimbraIsACLGroup',
          _content: memberURL !== '' ? 'FALSE' : 'TRUE',
        });
        attributes.push({
          n: 'memberURL',
          _content: memberURL,
        });
      } else {
        attributes.push({
          n: 'zimbraDistributionListSendShareMessageToNewMembers',
          _content: zimbraDistributionListSendShareMessageToNewMembers ? TRUE : FALSE,
        });
      }

      attributes.push({
        n: 'description',
        _content: description,
      });

      let dl: any = {};
      let action: any = {};
      if (ownerGrantEmailType?.value === PUB) {
        dl = { by: 'name', _content: name };
        action = {
          op: 'setRights',
          right: { right: 'sendToDistList', grantee: [] },
        };
      } else if (ownerGrantEmailType?.value === GRP) {
        dl = { by: 'name', _content: name };
        action = {
          op: 'setRights',
          right: {
            right: 'sendToDistList',
            grantee: [{ type: 'grp', by: 'name', _content: name }],
          },
        };
      } else if (ownerGrantEmailType?.value === ALL) {
        dl = { by: 'name', _content: name };
        action = {
          op: 'setRights',
          right: { right: 'sendToDistList', grantee: [{ type: 'all' }] },
        };
      } else if (ownerGrantEmailType?.value === EMAIL) {
        dl = { by: 'name', _content: name };
        action = {
          op: 'setRights',
          right: {
            right: 'sendToDistList',
            grantee: ownerGrantEmails.map((item: any) => ({
              type: 'email',
              by: 'name',
              _content: item,
            })),
          },
        };
      }
      createMailingList(dynamic, name, attributes)
        .then((data) => {
          const severity = 'success';
          let message = '';
          const mlId = data?.dl[0]?.id;
          addMemberToMailingList(members, owners, mlId, allOwnersList);
          callAllRequest([distributionListAction(dl, action)]);
          setShowCreateMailingListView(false);
          message = t('label.the_has_been_created_success', {
            name,
            defaultValue: 'The {{name}} has been created successfully',
          });
          createSnackbar({
            key: 'success',
            severity,
            label: message,
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
          setIsLoading(false);
        })
        .catch((error) => {
          let message = '';
          if (error?.message) {
            const text = error?.message;
            if (text.includes('no such domain')) {
              message = t('label.specified_domain_not_exist', 'Specified domain does not exist');
            } else if (text.includes('email address already exists')) {
              message = t('label.email_addready_exists', {
                name,
                defaultValue: 'Email address {{name}} already exists',
              });
            } else {
              message = text;
            }
          }
          createSnackbar({
            key: 'error',
            severity: 'error',
            label:
              message ||
              t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
          setIsLoading(false);
        });
    },
    [createSnackbar, t, addMemberToMailingList, callAllRequest],
  );

  useEffect(() => {
    const table = tableRef.current;

    const handleResize = debounce((): void => {
      if (table) {
        const tableHeight = table.clientHeight + 375;
        const viewportHeight = window.innerHeight;
        setIsTableTooTall(tableHeight > viewportHeight);
      }
    }, 100);

    if (table && !resizeObserverRef.current) {
      const observer = new ResizeObserver(handleResize);
      resizeObserverRef.current = observer;
      observer.observe(table);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, []);

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
              <Text size="medium" weight="bold" color="gray0">
                {t('label.distribution_list', 'Distribution List')}
              </Text>
            </Row>
            <Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
              <Padding all={'0'}>
                <Button color="primary" icon="Plus" onClick={onAddClick} />
              </Padding>
            </Row>
          </Row>
        </Container>
      </Row>
      <Row orientation="horizontal" width="100%" background="gray6">
        <divider-wc />
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
          <Container
            height="fit"
            crossAlignment="flex-start"
            background="gray6"
            style={{ position: 'relative' }}
          >
            <Row
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
              padding={{ bottom: 'large' }}
            >
              <Container>
                <Input
                  disabled={mailingList.length === 0 && searchString.length === 0 && !hasError}
                  backgroundColor="gray5"
                  label={t('label.search_dot', 'Search…')}
                  onChange={(e: any): any => {
                    setSearchString(e.target.value);
                  }}
                  CustomIcon={(): any => (
                    <icon-wc icon="FunnelOutline" size="large" color="primary"></icon-wc>
                  )}
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
                rows={!isRequestInProgress ? mailingList : []}
                headers={headers}
                showCheckbox={false}
                multiSelect={false}
                ref={tableRef}
                style={{
                  overflow: 'auto',
                  height: isRequestInProgress || mailingList.length === 0 ? '50%' : '100%',
                }}
                selectedRows={selectedDlRow}
                onSelectionChange={(selected: any): void => {
                  setSelectedDlRow(selected);
                }}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
              {isRequestInProgress && (
                <Container
                  crossAlignment="center"
                  mainAlignment="flex-start"
                  height="auto"
                  padding={{ top: 'medium' }}
                >
                  <Button
                    type="ghost"
                    color="primary"
                    label=""
                    loading
                    onClick={(): null => null}
                  />
                </Container>
              )}
              {mailingList.length === 0 && !isRequestInProgress && (
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
                    <Text weight="light" color="#828282" size="large" overflow="break-word">
                      {t('label.this_list_is_empty', 'This list is empty.')}
                    </Text>
                  </Row>
                  <Row
                    orientation="vertical"
                    crossAlignment="center"
                    style={{ textAlign: 'center' }}
                    padding={{ top: 'small' }}
                    width="53%"
                  >
                    <Text weight="light" color="#828282" size="large" overflow="break-word">
                      <Trans
                        i18nKey="label.create_distribution_list_msg"
                        defaults="You can create a new Distribution List by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
                        components={{ bold: <strong /> }}
                      />
                    </Text>
                  </Row>
                </Container>
              )}
            </Row>
            {mailingList && mailingList.length > 0 && (
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
      {showMailingListDetailView && (
        <ModalOverlay open={showMailingListDetailView} maxWidth="58.75rem">
          <EditMailingListView
            selectedMailingList={selectedMailingList}
            setIsUpdateRecord={setIsUpdateRecord}
            setShowMailingListDetailView={setShowMailingListDetailView}
          />
        </ModalOverlay>
      )}

      {showCreateMailingListView && (
        <ModalOverlay open={showCreateMailingListView} maxWidth="58.75rem">
          <CreateMailingList
            setShowCreateMailingListView={setShowCreateMailingListView}
            createMailingListReq={createMailingListReq}
            isLoading={isLoading}
          />
        </ModalOverlay>
      )}
    </Container>
  );
};

export default DomainMailingList;
