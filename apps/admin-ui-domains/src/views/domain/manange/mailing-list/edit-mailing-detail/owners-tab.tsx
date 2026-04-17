/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  CustomHeaderFactory,
  DropDownInput,
  HoverableRowFactory,
  Input,
  ListRow,
  Modal,
  Padding,
  Row,
  Table,
  useSnackbar,
} from '@zextras/ui-components';
import { sortedUniq, uniq, uniqBy } from 'lodash';
import { type ChangeEvent, type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import helmetLogo from '../../../../../assets/helmet_logo.svg';
import { ASC, DESC, GRP, USR } from '../../../../../constants';
import { distributionListAction } from '../../../../../services/distribution-list-action-service';
import { searchGal } from '../../../../../services/search-gal-service';
import { getAllEmailFromString, isValidEmail } from '../../../../utility/utils';
import { useSearchWithDebounce } from './hooks/use-search-with-debounce';
import { useTableFilter } from './hooks/use-table-filter';

type OwnersTabProps = {
  ownersList: Array<any>;
  setOwnersList: (list: Array<any>) => void;
  setPreviousDetail: (fn: any) => void;
  selectedMailingList: any;
  isRequestInProgress: boolean;
  setIsRequestInProgress: (v: boolean) => void;
  searchUserLabelValue: string;
};

export const OwnersTab: FC<OwnersTabProps> = ({
  ownersList,
  setOwnersList,
  setPreviousDetail,
  selectedMailingList,
  isRequestInProgress,
  setIsRequestInProgress,
  searchUserLabelValue,
}) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const [ownerTableRows, setOwnerTableRows] = useState<Array<any>>([]);
  const [selectedOwnerListMember, setSelectedOwnerListMember] = useState<Array<any>>([]);
  const [searchOwner, setSearchOwner] = useState('');
  const [searchOwnerResult, setSearchOwnerResult] = useState<Array<any>>([]);
  const [isShowOwnerError, setIsShowOwnerError] = useState(false);
  const [ownerErrorMessage, setOwnerErrorMessage] = useState<string | null>('');
  const [allOwnerList, setAllOwnerList] = useState<Array<any>>([]);
  const [isOpenDeleteOwnerDialog, setIsOpenDeleteOwnerDialog] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<any>(null);

  const {
    filterValue: filterOwner,
    filteredRows: filteredOwnerRows,
    handleFilterChange: handleInputChangeOwner,
  } = useTableFilter(ownerTableRows);

  const _allOwnerLists = useMemo(
    () =>
      ownersList.map((item: any) => ({
        id: item?.id,
        name: item?.name,
        type: item?.type,
      })),
    [ownersList],
  );

  const getOwnerType = useCallback(
    (email?: string): any => {
      let type = 'email';
      const all = [..._allOwnerLists, ...allOwnerList];
      all.forEach((item: any) => {
        if (item?.id && item?.type && item?.email === email) {
          type = item?.type === 'group' || item?.type === GRP ? GRP : USR;
        }
      });
      return type;
    },
    [allOwnerList, _allOwnerLists],
  );

  const ownerHeaders: Array<any> = useMemo(
    () => [
      {
        id: 'owners',
        label: t('label.owners', 'Owners'),
        width: '80%',
        bold: true,
        sortable: true,
        onSortChange: (id: string, order: typeof ASC | typeof DESC): void => {
          const sortFn = (a: any, b: any): number => {
            const nameA = a?.columns[0]?.props?.children?.toLowerCase() || '';
            const nameB = b?.columns[0]?.props?.children?.toLowerCase() || '';
            if (order === ASC) {
              return nameA.localeCompare(nameB);
            } else {
              return nameB.localeCompare(nameA);
            }
          };
          setOwnerTableRows([...ownerTableRows].sort(sortFn));
        },
      },
      {
        id: 'actions',
        label: t('label.actions', 'Actions'),
        width: '20%',
        bold: true,
      },
    ],
    [t, ownerTableRows],
  );

  const searchOwnerList = searchOwnerResult.map((item: any) => ({
    id: item.id,
    label: item.name,
    customComponent: (
      <Row
        style={{
          display: 'block',
          textAlign: 'left',
          height: 'inherit',
          padding: '3px',
          width: 'inherit',
        }}
        onClick={(): void => {
          setSearchOwner(item?.name);
        }}
      >
        {item?.name}
      </Row>
    ),
  }));

  useEffect(() => {
    if (ownersList && ownersList.length > 0) {
      const sortedOwners = [...ownersList].sort((a: any, b: any) =>
        (a?.name?.toLowerCase() || '').localeCompare(b?.name?.toLowerCase() || ''),
      );
      const allRows = sortedOwners.map((item: any) => ({
        id: item?.name,
        columns: [
          <ds-text as="span"
            size="small"
            weight="regular"
            key={item?.id}
            color="gray0"
            onClick={(): void => {
              setSelectedOwnerListMember([item?.name]);
            }}
          >
            {item?.name}
          </ds-text>,
          <Button
            key="delete_owner_btn"
            type="ghost"
            color="error"
            size="medium"
            icon="Trash2Outline"
            style={{ position: 'inherit' }}
            aria-label={t('label.delete', 'Delete')}
            onClick={(): void => {
              setOwnerToDelete(item);
              setIsOpenDeleteOwnerDialog(true);
            }}
          />,
        ],
      }));
      setOwnerTableRows(allRows);
    } else {
      setOwnerTableRows([]);
    }
  }, [ownersList]);

  const getSearchOwnerList = useCallback(
    (searchKeyword: string) => {
      searchGal(searchKeyword).then((data) => {
        const contactList = data?.cn;
        if (contactList) {
          let result: Array<any> = [];
          result = contactList.map((item: any): any => ({
            id: item?.id,
            name: item?._attrs?.email,
          }));
          setAllOwnerList(
            uniqBy(
              allOwnerList.concat(
                contactList.map((item: any) => ({
                  id: item?.id,
                  name: item?._attrs?.email,
                  type: item?._attrs?.type,
                })),
              ),
              'id',
            ),
          );
          setSearchOwnerResult(result);
        } else {
          setSearchOwnerResult([]);
        }
      });
    },
    [allOwnerList],
  );

  useSearchWithDebounce(searchOwner, getSearchOwnerList);

  const onAddOwner = useCallback((): void => {
    if (searchOwner !== '') {
      const specialChars = /[ `'"<>,;]/;
      const allEmails: Array<any> = specialChars.test(searchOwner)
        ? getAllEmailFromString(searchOwner)
        : [searchOwner];
      if (allEmails !== null && allEmails !== undefined) {
        const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
        if (inValidEmailAddress && inValidEmailAddress.length > 0) {
          setIsShowOwnerError(true);
          setOwnerErrorMessage(
            t(
              'domain.distributionList.invalidEmailErrorMsg',
              'The account does not exist. Please check the spelling and try again.',
            ),
          );
        } else if (ownersList.find((item: any) => item?.name === searchOwner)) {
          setIsShowOwnerError(true);
          setOwnerErrorMessage(
            t(
              'label.distribution_list_already_in_list_error',
              'The Distribution List / User is already in the list',
            ),
          );
        } else {
          setIsShowOwnerError(false);
          const sortedList = sortedUniq(allEmails);
          const newOwners = sortedList.map((item: any) => ({ name: item, id: item }));
          setIsRequestInProgress(true);
          const addOwnerRequests = newOwners.map((owner: any) => {
            const dl: any = {
              by: 'id',
              _content: selectedMailingList?.id,
            };
            const action: any = {
              op: 'addOwners',
              owner: {
                by: 'name',
                type: getOwnerType(owner?.name),
                _content: owner?.name,
              },
            };
            return distributionListAction(dl, action);
          });
          Promise.all(addOwnerRequests)
            .then((responses: any) => {
              const fault = responses.find((r: any) => r?.Fault);
              if (fault) {
                createSnackbar({
                  key: 'error',
                  severity: 'error',
                  label: fault?.Fault?.Reason?.Text,
                  autoHideTimeout: 3000,
                  hideButton: true,
                  replace: true,
                });
              } else {
                const updatedOwners = uniq(ownersList.concat(newOwners));
                setOwnersList(updatedOwners);
                setPreviousDetail((prevState: any) => ({
                  ...prevState,
                  ownersList: updatedOwners,
                }));
                setSearchOwner('');
                createSnackbar({
                  key: 'success',
                  severity: 'success',
                  label: t(
                    'domain.distributionList.ownerAddedSuccessfully',
                    'Owner has been added successfully',
                  ),
                  autoHideTimeout: 3000,
                  hideButton: true,
                  replace: true,
                });
              }
              setIsRequestInProgress(false);
            })
            .catch((error: any) => {
              createSnackbar({
                key: 'error',
                severity: 'error',
                label: error?.message
                  ? error?.message
                  : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
                autoHideTimeout: 3000,
                hideButton: true,
                replace: true,
              });
              setIsRequestInProgress(false);
            });
        }
      } else if (allEmails === undefined) {
        setIsShowOwnerError(true);
        setOwnerErrorMessage(
          t(
            'domain.distributionList.invalidEmailErrorMsg',
            'The account does not exist. Please check the spelling and try again.',
          ),
        );
      }
    } else {
      setIsShowOwnerError(true);
      setOwnerErrorMessage(
        t('domain.distributionList.blankEmailErrorMsg', 'Please enter at least one email address'),
      );
    }
  }, [
    searchOwner,
    t,
    ownersList,
    selectedMailingList?.id,
    getOwnerType,
    createSnackbar,
    setOwnersList,
    setPreviousDetail,
    setIsRequestInProgress,
  ]);

  const closeDeleteOwnerHandler = useCallback(() => {
    setIsOpenDeleteOwnerDialog(false);
    setOwnerToDelete(null);
  }, []);

  const onDeleteOwnerConfirm = useCallback(() => {
    if (!ownerToDelete) return;
    setIsRequestInProgress(true);
    const dl: any = {
      by: 'id',
      _content: selectedMailingList?.id,
    };
    const action: any = {
      op: 'removeOwners',
      owner: {
        by: 'name',
        type: getOwnerType(ownerToDelete?.name),
        _content: ownerToDelete?.name,
      },
    };
    distributionListAction(dl, action)
      .then((response: any) => {
        if (response?.Fault) {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: response?.Fault?.Reason?.Text,
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        } else {
          const updatedOwners = ownersList.filter(
            (item: any) => item?.name !== ownerToDelete?.name,
          );
          setOwnersList(updatedOwners);
          setSelectedOwnerListMember([]);
          setPreviousDetail((prevState: any) => ({
            ...prevState,
            ownersList: updatedOwners,
          }));
          createSnackbar({
            key: 'success',
            severity: 'success',
            label: t(
              'domain.distributionList.ownerDeletedSuccessfully',
              'Owner has been removed successfully',
            ),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        }
        setIsRequestInProgress(false);
        closeDeleteOwnerHandler();
      })
      .catch((error: any) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        setIsRequestInProgress(false);
        closeDeleteOwnerHandler();
      });
  }, [
    ownerToDelete,
    selectedMailingList?.id,
    getOwnerType,
    ownersList,
    createSnackbar,
    t,
    closeDeleteOwnerHandler,
    setOwnersList,
    setPreviousDetail,
    setIsRequestInProgress,
  ]);

  return (
    <>
      <Container
        padding={{ left: 'large', right: 'large', bottom: 'large' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 3.6rem)"
        background="white"
        width={'58.75rem'}
        style={{ overflow: 'auto' }}
      >
        <Row padding={{ top: 'medium' }}>
          <ds-text as="h4" weight="bold" color="gray0">
            {t('domain.distributionList.manageOwners', 'Manage owners')}
          </ds-text>
        </Row>
        <ListRow padding={{ top: 'small' }}>
          <ds-text as="p" size="small" color="gray0" style={{ whiteSpace: 'normal' }} overflow="break-word">
            {t(
              'label.owners_description_msg_1',
              'Owners can add and remove members, change displayname and description, change list visibility (ie. to hide in gal), change the ownership, modify the subscription/unsubscription behaviour.',
            )}
          </ds-text>
        </ListRow>

        <ListRow>
          <Container orientation="vertical" mainAlignment="flex-start" background="gray6">
            <Row
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              width="100%"
              padding={{ top: 'large' }}
            >
              <DropDownInput
                width="100%"
                items={searchOwnerList}
                inputLabel={t(
                  'domain.distributionList.addOwnersByEmail',
                  'Add owners by email address',
                )}
                size="medium"
                onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                  setSearchOwner(e.target.value);
                }}
                inputValue={searchOwner}
                isCustomIcon={false}
                hasError={isShowOwnerError}
              />
            </Row>
            {isShowOwnerError && (
              <Row
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                width="100%"
                padding={{ top: 'small' }}
              >
                <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
                  <Padding right={'0'}>
                    <ds-text as="span" size="extrasmall" weight="regular" color="error">
                      {ownerErrorMessage}
                    </ds-text>
                  </Padding>
                </Container>
              </Row>
            )}
            <Row
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              width="100%"
              padding={{ top: 'large', bottom: 'large' }}
            >
              <Button
                icon="Plus"
                key="add-button"
                label={t('domain.distributionList.addOwners', 'Add Owners')}
                color="primary"
                iconPlacement="left"
                onClick={onAddOwner}
                size="medium"
              />
            </Row>
          </Container>
        </ListRow>
        <ds-divider />
        <ListRow>
          <Container
            padding={{
              top: 'extralarge',
              bottom: 'small',
            }}
            mainAlignment="flex-start"
          >
            <Row
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ bottom: 'large' }}
              width="100%"
            >
              <ds-text as="h4" weight="bold" color="gray0">
                {t('domain.distributionList.ownersList', 'Owners List')}
              </ds-text>
            </Row>
            {ownerTableRows.length > 0 && (
              <ListRow>
                <Row width="100%" mainAlignment="flex-start" padding={{ bottom: 'large' }}>
                  <Input
                    label={t('label.filter', 'Filter') + ' ' + t('label.address', 'Address')}
                    value={filterOwner}
                    backgroundColor="gray5"
                    onChange={handleInputChangeOwner}
                    CustomIcon={(): any => (
                      <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
                    )}
                  />
                </Row>
              </ListRow>
            )}
            <Table
              rows={filterOwner ? filteredOwnerRows : ownerTableRows}
              headers={ownerHeaders}
              showCheckbox={false}
              selectedRows={selectedOwnerListMember}
              RowFactory={HoverableRowFactory}
              HeaderFactory={CustomHeaderFactory}
            />
          </Container>
        </ListRow>

        {ownerTableRows.length === 0 && (
          <ListRow padding={{ all: 'small' }}>
            <Container
              background="gray6"
              height="fit-content"
              mainAlignment="center"
              crossAlignment="center"
            >
              <Padding value="57px 0 0 0" width="100%">
                <Row mainAlignment="center" width="100%">
                  <img src={helmetLogo} alt="logo" />
                </Row>
              </Padding>
              <Padding vertical="extralarge" width="100%">
                <Row mainAlignment="center" width="100%">
                  <ds-text as="p" size="large" color="secondary" weight="regular">
                    {t('label.there_are_no_owners', "There aren't owners here.")}
                  </ds-text>
                </Row>
                <Row mainAlignment="center" width="100%">
                  <ds-text as="p" size="large" color="secondary" weight="regular">
                    {searchUserLabelValue}
                  </ds-text>
                </Row>
              </Padding>
            </Container>
          </ListRow>
        )}
      </Container>
      {isOpenDeleteOwnerDialog && (
        <Modal
          size="small"
          title={t('domain.distributionList.owners.removeOwner', 'Remove owner')}
          open={isOpenDeleteOwnerDialog}
          customFooter={
            <Container orientation="horizontal" mainAlignment="flex-end">
              <Row style={{ gap: '1rem' }}>
                <Button
                  label={t('domain.distributionList.NoCancel', 'NO, CANCEL')}
                  color="gray0"
                  type="outlined"
                  onClick={closeDeleteOwnerHandler}
                  disabled={isRequestInProgress}
                />
                <Button
                  label={t('domain.distributionList.yesRemoveIt', 'YES, REMOVE IT')}
                  color="error"
                  onClick={onDeleteOwnerConfirm}
                  disabled={isRequestInProgress}
                />
              </Row>
            </Container>
          }
          showCloseIcon
          onClose={closeDeleteOwnerHandler}
        >
          <Container
            padding={{ top: 'extralarge', bottom: 'extralarge' }}
            mainAlignment="flex-start"
          >
            <ds-text as="p" size={'large'} overflow="break-word">
              <Trans
                i18nKey="domain.distributionList.owners.areYouSureDeleteOwner"
                defaults="Are you sure you want to remove <bold>{{name}}</bold> from the owners list?"
                components={{ bold: <strong /> }}
                values={{
                  name: ownerToDelete?.name,
                }}
              />
            </ds-text>
          </Container>
        </Modal>
      )}
    </>
  );
};
