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
  Paging,
  Row,
  Table,
  type THeader,
  type TRow,
  useSnackbar,
} from '@zextras/ui-components';
import { searchDirectory } from '@zextras/ui-shared';
import { sortedUniq, uniq } from 'lodash';
import {
  type ChangeEvent,
  type Dispatch,
  type FC,
  type ReactElement,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type {
  SoapFaultResponse,
  SoapNamedContent,
} from '../../../../../../types';
import helmetLogo from '../../../../../assets/helmet_logo.svg';
import { RECORD_DISPLAY_LIMIT } from '../../../../../constants';
import { addDistributionListMember } from '../../../../../services/add-distributionlist-member-service';
import { removeDistributionListMember } from '../../../../../services/remove-distributionlist-member-service';
import { generateSnackbarFromError } from '../../../../error/generate-snackbar-error';
import { getAllEmailFromString, isValidEmail } from '../../../../utility/utils';
import { useSearchWithDebounce } from './hooks/use-search-with-debounce';
import type {
  GranteeEntry,
  MailingListFormSnapshot,
  SelectedMailingList,
} from './types';

type MembersTabProps = {
  dlm: Array<string>;
  setDlm: (dlm: Array<string>) => void;
  setPreviousDetail: Dispatch<SetStateAction<MailingListFormSnapshot>>;
  selectedMailingList: SelectedMailingList;
  isRequestInProgress: boolean;
  setIsRequestInProgress: (v: boolean) => void;
  searchUserLabelValue: string;
  isGlobalAdmin: boolean;
  memberURL: string | undefined;
  setMemberURL: (v: string) => void;
};

export const MembersTab: FC<MembersTabProps> = ({
  dlm,
  setDlm,
  setPreviousDetail,
  selectedMailingList,
  isRequestInProgress,
  setIsRequestInProgress,
  searchUserLabelValue,
  isGlobalAdmin,
  memberURL,
  setMemberURL,
}) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const limit = 15;
  const [dlmTableRows, setDlmTableRows] = useState<Array<TRow>>([]);
  const [DLMPagedRows, setDLMPagedRows] = useState<Array<TRow>>([]);
  const [selectedDistributionListMember, setSelectedDistributionListMember] = useState<Array<string>>(
    [],
  );
  const [searchMember, setSearchMember] = useState('');
  const [searchMemberResult, setSearchMemberResult] = useState<Array<GranteeEntry>>([]);
  const [isShowMemberError, setIsShowMemberError] = useState(false);
  const [memberErrorMessage, setMemberErrorMessage] = useState<string | null>('');
  const [offset, setOffset] = useState(0);
  const [DLMCurrentPage, setDLMSearchCurrentPage] = useState(1);
  const [filterMember, setFilterMember] = useState('');
  const [filteredDlmTableRows, setFilteredDlmTableRows] = useState<Array<TRow>>([]);
  const [isOpenDeleteMemberDialog, setIsOpenDeleteMemberDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const memberHeaders: Array<THeader> = useMemo(
    () => [
      {
        id: 'members',
        label: t('label.members', 'Members'),
        width: '80%',
        bold: true,
      },
      !selectedMailingList?.dynamic
        ? {
          id: 'actions',
          label: t('label.actions', 'Actions'),
          width: '20%',
          bold: false,
        }
        : { id: 'actions', label: '', width: '0%', bold: false },
    ],
    [t],
  );

  const searchMemberItems = searchMemberResult.map((item) => ({
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
          setSearchMember(item?.name);
        }}
      >
        {item?.name}
      </Row>
    ),
  }));

  useEffect(() => {
    if (dlm && dlm.length > 0) {
      if (!filterMember) {
        const allRows = dlm.map((item) => ({
          id: item,
          columns: [
            <ds-text as="span"
              size="small"
              weight="regular"
              key={item}
              color="gray0"
              onClick={(): void => {
                setSelectedDistributionListMember([item]);
              }}
            >
              {item}
            </ds-text>,
            selectedMailingList?.dynamic ? null : (
              <Button
                type="ghost"
                color={'error'}
                size="medium"
                icon="Trash2Outline"
                style={{ position: 'inherit' }}
                aria-label={t('label.delete', 'Delete')}
                onClick={(): void => {
                  setMemberToDelete(item);
                  setIsOpenDeleteMemberDialog(true);
                }}
              />
            ),
          ],
        }));
        const pagedRows = allRows.slice(offset, offset + limit);
        setDlmTableRows(allRows as unknown as Array<TRow>);
        setDLMPagedRows(pagedRows as unknown as Array<TRow>);
      } else {
        const filteredRows = dlm
          .filter((item) => item.toLowerCase().includes(filterMember.toLowerCase()))
          .map((item) => ({
            id: item,
            columns: [
              <ds-text as="span"
                size="small"
                weight="regular"
                key={item}
                color="gray0"
                onClick={(): void => {
                  setSelectedDistributionListMember([item]);
                }}
              >
                {item}
              </ds-text>,
              selectedMailingList?.dynamic ? null : (
                <Button
                  type="ghost"
                  color={'error'}
                  size="medium"
                  icon="Trash2Outline"
                  style={{ position: 'inherit' }}
                  aria-label={t('label.delete', 'Delete')}
                  onClick={(): void => {
                    setMemberToDelete(item);
                    setIsOpenDeleteMemberDialog(true);
                  }}
                />
              ),
            ],
          }));
        const pagedRows = filteredRows.slice(offset, offset + limit);
        setDlmTableRows(filteredRows as unknown as Array<TRow>);
        setDLMPagedRows(pagedRows as unknown as Array<TRow>);
      }
    } else {
      setDlmTableRows([]);
      setDLMPagedRows([]);
      setOffset(0);
      setDLMSearchCurrentPage(1);
    }
  }, [dlm, offset, filterMember]);

  const getSearchMemberList = useCallback(
    (mem: string) => {
      const attrs =
        'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraMailStatus';
      const types = 'accounts,distributionlists,aliases';
      const query = `(&(!(zimbraAccountStatus=closed))(!(zimbraIsAdminGroup=TRUE))(|(mail=*${mem}*)(cn=*${mem}*)(sn=*${mem}*)(gn=*${mem}*)(displayName=*${mem}*)(zimbraMailDeliveryAddress=*${mem}*)(zimbraMailAlias=*${mem}*)))`;

      searchDirectory({ attr: attrs, type: types, domainName: '', query, offset: 0, limit: RECORD_DISPLAY_LIMIT, sortBy: 'name' })
        .then((data) => {
          const result: Array<GranteeEntry> = [];
          const dl = data?.dl;
          const account = data?.account;
          const alias = data?.alias;
          if (dl) {
            dl.map((item: GranteeEntry) => result.push(item));
          }
          if (account) {
            account.map((item: GranteeEntry) => result.push(item));
          }
          if (alias) {
            alias.map((item: GranteeEntry) => result.push(item));
          }
          setSearchMemberResult(result);
        })
        .catch((error) => {
          const snackbarConfig = generateSnackbarFromError(error, t);
          createSnackbar(snackbarConfig);
        });
    },
    [createSnackbar, t],
  );

  useSearchWithDebounce(searchMember, getSearchMemberList);

  const onAdd = useCallback((): void => {
    if (searchMember !== '') {
      const specialChars = /[ `'"<>,;]/;
      const allEmails: Array<string> = specialChars.test(searchMember)
        ? getAllEmailFromString(searchMember)
        : [searchMember];
      if (allEmails !== null && allEmails !== undefined) {
        const inValidEmailAddress = allEmails.filter((item) => !isValidEmail(item));
        if (inValidEmailAddress && inValidEmailAddress.length > 0) {
          setIsShowMemberError(true);
          setMemberErrorMessage(
            t(
              'domain.distributionList.invalidEmailErrorMsg',
              'The account does not exist. Please check the spelling and try again.',
            ),
          );
        } else if (dlm.find((item) => item === searchMember)) {
          setIsShowMemberError(true);
          setMemberErrorMessage(
            t(
              'label.distribution_list_already_in_list_error',
              'The Distribution List / User is already in the list',
            ),
          );
        } else {
          const sortedList = sortedUniq(allEmails);
          const newMembers = sortedList.filter((item) => !dlm.includes(item));
          if (newMembers.length === 0) return;
          setIsRequestInProgress(true);
          const addRequests = newMembers.map((item) => {
            const id: SoapNamedContent = {
              n: 'id',
              _content: selectedMailingList?.id,
            };
            const dlmItem: SoapNamedContent = {
              n: 'dlm',
              _content: item,
            };
            return addDistributionListMember(id, dlmItem);
          });
          Promise.all(addRequests)
            .then((responses) => {
              const fault = (responses as unknown as Array<SoapFaultResponse>).find((r) => r?.Fault);
              if (fault) {
                createSnackbar({
                  key: 'error',
                  severity: 'error',
                  label:
                    fault?.Fault?.Reason?.Text ??
                    t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
                  autoHideTimeout: 3000,
                  hideButton: true,
                  replace: true,
                });
              } else {
                const updatedDlm = uniq(dlm.concat(newMembers));
                setDlm(updatedDlm);
                setPreviousDetail((prevState) => ({
                  ...prevState,
                  dlm: updatedDlm,
                }));
                setIsShowMemberError(false);
                setSearchMember('');
                setMemberErrorMessage('');
                createSnackbar({
                  key: 'success',
                  severity: 'success',
                  label: t(
                    'domain.distributionList.memberAddedSuccessfully',
                    'Member has been added successfully',
                  ),
                  autoHideTimeout: 3000,
                  hideButton: true,
                  replace: true,
                });
              }
              setIsRequestInProgress(false);
            })
            .catch((error) => {
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
        setMemberErrorMessage(
          t(
            'domain.distributionList.invalidEmailErrorMsg',
            'The account does not exist. Please check the spelling and try again.',
          ),
        );
        setIsShowMemberError(true);
      }
    } else {
      setIsShowMemberError(true);
      setMemberErrorMessage(
        t('domain.distributionList.blankEmailErrorMsg', 'Please enter at least one email address'),
      );
    }
  }, [
    searchMember,
    t,
    dlm,
    selectedMailingList?.id,
    createSnackbar,
    setDlm,
    setPreviousDetail,
    setIsRequestInProgress,
  ]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value != '') {
      setFilterMember(value);
      setDLMSearchCurrentPage(1);
      setOffset(0);
      const allRows = dlmTableRows.filter((item) =>
        item?.id.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredDlmTableRows(allRows);
      const pagedRows = allRows.slice(0, limit);
      setDLMPagedRows(pagedRows);
    } else {
      setFilterMember('');
      setDLMSearchCurrentPage(1);
      setOffset(0);
      const pagedRows = dlmTableRows.slice(0, limit);
      setFilteredDlmTableRows([]);
      setDLMPagedRows(pagedRows);
    }
  };

  const closeDeleteMemberHandler = useCallback(() => {
    setIsOpenDeleteMemberDialog(false);
    setMemberToDelete(null);
  }, []);

  const onDeleteMemberConfirm = useCallback(() => {
    if (!memberToDelete) return;
    setIsRequestInProgress(true);
    const id: SoapNamedContent = {
      n: 'id',
      _content: selectedMailingList?.id,
    };
    const dlmItem: SoapNamedContent = {
      n: 'dlm',
      _content: memberToDelete,
    };
    removeDistributionListMember(id, dlmItem)
      .then((response) => {
        if ((response as unknown as SoapFaultResponse)?.Fault) {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label:
              (response as unknown as SoapFaultResponse)?.Fault?.Reason?.Text ??
              t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        } else {
          const updatedDlm = dlm.filter((item) => item !== memberToDelete);
          setDlm(updatedDlm);
          setSelectedDistributionListMember([]);
          setPreviousDetail((prevState) => ({
            ...prevState,
            dlm: updatedDlm,
          }));
          if (DLMPagedRows.length === 1) {
            setDLMSearchCurrentPage(1);
            setOffset(0);
            setFilterMember('');
          }
          createSnackbar({
            key: 'success',
            severity: 'success',
            label: t(
              'domain.distributionList.memberDeletedSuccessfully',
              'Member has been removed successfully',
            ),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        }
        setIsRequestInProgress(false);
        closeDeleteMemberHandler();
      })
      .catch((error) => {
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
        closeDeleteMemberHandler();
      });
  }, [
    memberToDelete,
    selectedMailingList?.id,
    dlm,
    DLMPagedRows,
    createSnackbar,
    t,
    closeDeleteMemberHandler,
    setDlm,
    setPreviousDetail,
    setIsRequestInProgress,
  ]);

  return (
    <>
      <Container
        padding={{ left: 'large', right: 'large', bottom: 'large' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 6.6rem)"
        background="white"
        width={'58.75rem'}
        style={{ overflow: 'auto' }}
      >
        {selectedMailingList?.dynamic && (
          <>
            <Row padding={{ bottom: 'medium', top: 'medium' }}>
              <ds-text as="h3" size="medium" weight="bold" color="gray0">
                {t('label.dynamic_mode', 'Dynamic Mode')}
              </ds-text>
            </Row>
            <ListRow padding={{ all: 'small' }}>
              <Container orientation="horizontal">
                <Container>
                  <Input
                    label={t('label.distribution_list_url', "Distribution List's URL")}
                    value={memberURL}
                    backgroundColor="gray5"
                    onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                      setMemberURL(e.target.value);
                    }}
                    disabled={!isGlobalAdmin}
                  />
                </Container>
              </Container>
            </ListRow>
          </>
        )}
        {!selectedMailingList?.dynamic && (
          <>
            <Row padding={{ bottom: 'small', top: 'medium' }}>
              <ds-text as="h3" size="medium" weight="bold" color="gray0">
                {t('label.members', 'Members')}
              </ds-text>
            </Row>
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
                    items={searchMemberItems}
                    inputLabel={t(
                      'label.type_accounts_paste_them_here',
                      'Type the Accounts or paste them here',
                    )}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                      setSearchMember(e.target.value);
                    }}
                    inputValue={searchMember}
                    isCustomIcon={false}
                    hasError={isShowMemberError}
                  />
                </Row>
                {isShowMemberError && (
                  <Row
                    mainAlignment="flex-start"
                    crossAlignment="flex-start"
                    width="100%"
                    padding={{ top: 'small' }}
                  >
                    <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
                      <Padding right={'0'}>
                        <ds-text as="span" size="extrasmall" weight="regular" color="error">
                          {memberErrorMessage}
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
                    key="add-members-button"
                    label={t('domain.distributionList.members.addMembers', 'Add Members')}
                    color="primary"
                    iconPlacement="left"
                    onClick={onAdd}
                    size="medium"
                  />
                </Row>
              </Container>
            </ListRow>
          </>
        )}
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
                {t('domain.distributionList.members.membersList', 'Members List')}
              </ds-text>
            </Row>
            {(dlmTableRows.length > 0 || filterMember !== '') && (
              <ListRow>
                <Row width="100%" mainAlignment="flex-start" padding={{ bottom: 'large' }}>
                  <Input
                    label={t('label.filter', 'Filter') + ' ' + t('label.address', 'Address')}
                    value={filterMember}
                    backgroundColor="gray5"
                    onChange={handleInputChange}
                    CustomIcon={(): ReactElement => (
                      <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
                    )}
                  />
                </Row>
              </ListRow>
            )}
            <Table
              rows={DLMPagedRows}
              headers={memberHeaders}
              showCheckbox={false}
              selectedRows={selectedDistributionListMember}
              RowFactory={HoverableRowFactory}
              HeaderFactory={CustomHeaderFactory}
              onSelectionChange={(selectedRows) => {
                setSelectedDistributionListMember(selectedRows);
              }}
            />
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
                  <Paging
                    totalItem={filterMember ? filteredDlmTableRows.length : dlmTableRows.length}
                    setOffset={setOffset}
                    pageSize={limit}
                    currentPageProp={DLMCurrentPage}
                    onPageChange={setDLMSearchCurrentPage}
                  />
                </Container>
              </Container>
            </Container>
          </Container>
        </ListRow>

        {dlmTableRows.length === 0 && !selectedMailingList?.dynamic && filterMember !== '' && (
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
                    {t('label.there_are_not_member_here', "There aren't members here.")}
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
      {isOpenDeleteMemberDialog && (
        <Modal
          size="small"
          title={t('domain.distributionList.members.removeMember', 'Remove member')}
          open={isOpenDeleteMemberDialog}
          customFooter={
            <Container orientation="horizontal" mainAlignment="flex-end" style={{ gap: '1rem' }}>
              <Row style={{ gap: '1rem' }}>
                <Button
                  label={t('domain.distributionList.NoCancel', 'NO, CANCEL')}
                  color="gray0"
                  type="outlined"
                  onClick={closeDeleteMemberHandler}
                  disabled={isRequestInProgress}
                />
                <Button
                  label={t('domain.distributionList.yesRemoveIt', 'YES, REMOVE IT')}
                  color="error"
                  onClick={onDeleteMemberConfirm}
                  disabled={isRequestInProgress}
                />
              </Row>
            </Container>
          }
          showCloseIcon
          onClose={closeDeleteMemberHandler}
        >
          <Container
            padding={{ top: 'extralarge', bottom: 'extralarge' }}
            mainAlignment="flex-start"
          >
            <ds-text as="p" size={'large'} overflow="break-word">
              <Trans
                i18nKey="domain.distributionList.members.areYouSureDeleteMember"
                defaults="Are you sure you want to remove <bold>{{name}}</bold> from the members list?"
                components={{ bold: <strong /> }}
                values={{
                  name: memberToDelete,
                }}
              />
            </ds-text>
          </Container>
        </Modal>
      )}
    </>
  );
};
