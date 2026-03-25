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
  Radio,
  RadioGroup,
  Row,
  Table,
  Text,
  useSnackbar,
} from '@zextras/ui-components';
import { sortedUniq, uniq } from 'lodash';
import { type ChangeEvent, type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import helmetLogo from '../../../../../assets/helmet_logo.svg';
import { distributionListAction } from '../../../../../services/distribution-list-action-service';
import { searchGal } from '../../../../../services/search-gal-service';
import { getAllEmailFromString, isValidEmail } from '../../../../utility/utils';
import { useSearchWithDebounce } from './hooks/use-search-with-debounce';
import { useTableFilter } from './hooks/use-table-filter';

type SendAsTabProps = {
  sendEmailsList: Array<any>;
  setSendEmailsList: (list: Array<any>) => void;
  setSendEmails: (list: Array<any>) => void;
  setPreviousDetail: (fn: any) => void;
  selectedMailingList: any;
  isRequestInProgress: boolean;
  setIsRequestInProgress: (v: boolean) => void;
  searchUserLabelValue: string;
};

export const SendAsTab: FC<SendAsTabProps> = ({
  sendEmailsList,
  setSendEmailsList,
  setSendEmails,
  setPreviousDetail,
  selectedMailingList,
  isRequestInProgress,
  setIsRequestInProgress,
  searchUserLabelValue,
}) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const [sendEmailTableRows, setSendEmailTableRows] = useState<Array<any>>([]);
  const [selectedSendEmail, setSelectedSendEmail] = useState<Array<any>>([]);
  const [sendEmailItem, setSendEmailItem] = useState('');
  const [radioPermisionValue, setRadioPermisionValue] = useState('sendAs');
  const [isOpenDeleteSendEmailDialog, setIsOpenDeleteSendEmailDialog] = useState(false);
  const [sendEmailToDelete, setSendEmailToDelete] = useState<any>(null);
  const [isOpenEditPermissionDialog, setIsOpenEditPermissionDialog] = useState(false);
  const [editingEmailItem, setEditingEmailItem] = useState<any>(null);
  const [editPermissionValue, setEditPermissionValue] = useState('sendAs');
  const [searchGrantEmailResult, setSearchGrantEmailResult] = useState<Array<any>>([]);
  const [isShowSendEmailError, setIsShowSendEmailError] = useState(false);
  const [sendEmailErrorMessage, setSendEmailErrorMessage] = useState<string | null>('');

  const {
    filterValue: filterSendEmail,
    filteredRows: filteredSendEmailRows,
    handleFilterChange: handleInputChangeSendEmail,
  } = useTableFilter(sendEmailTableRows);

  const sendEmailHeaders: Array<any> = useMemo(
    () => [
      {
        id: 'sendEmail',
        label: t('domain.distributionList.sendAs.authorizedSenders', 'Authorized senders'),
        width: '50%',
        bold: true,
      },
      {
        id: 'sendAcl',
        label: t('domain.distributionList.sendAs.permissionLevel', 'Permission level'),
        width: '30%',
        bold: true,
      },
      {
        id: 'actions',
        label: t('label.actions', 'Actions'),
        width: '20%',
        bold: true,
      },
    ],
    [t],
  );

  const sendItems = searchGrantEmailResult.map((item: any) => ({
    id: item?.id,
    label: item?.name,
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
          setSendEmailItem(item?.name);
        }}
      >
        {item?.name}
      </Row>
    ),
  }));

  useEffect(() => {
    if (sendEmailsList && sendEmailsList.length > 0) {
      const allRows = sendEmailsList.map((item: any) => ({
        id: item?.name,
        columns: [
          <Text
            size="small"
            weight="regular"
            key={item?.id}
            color="gray0"
            onClick={(): void => {
              setSelectedSendEmail([item?.name]);
            }}
          >
            {item?.name}
          </Text>,
          <Text
            size="small"
            weight="regular"
            key={item?.id + '_acl'}
            color="gray0"
            onClick={(): void => {
              setSelectedSendEmail([item?.name]);
            }}
          >
            {item?.sendAcl === 'sendAsDistList'
              ? t('domain.distributionList.sendAs.sendAs', 'Send As')
              : t('domain.distributionList.sendAs.sendOnBehalfOf', 'Send on behalf of')}
          </Text>,
          <Container key="send_email_actions" orientation="horizontal" mainAlignment="flex-start">
            <Button
              type="ghost"
              color={'info'}
              size="medium"
              icon="EditOutline"
              style={{ position: 'inherit', marginRight: '0.5rem' }}
              aria-label={t('label.edit', 'Edit')}
              onClick={(): void => {
                setEditingEmailItem(item);
                setEditPermissionValue(
                  item?.sendAcl === 'sendAsDistList' ? 'sendAs' : 'sendOnBehalfOf',
                );
                setIsOpenEditPermissionDialog(true);
              }}
            />
            <Button
              type="ghost"
              color={'error'}
              size="medium"
              icon="Trash2Outline"
              style={{ position: 'inherit' }}
              aria-label={t('label.delete', 'Delete')}
              onClick={(): void => {
                setSendEmailToDelete(item);
                setIsOpenDeleteSendEmailDialog(true);
              }}
            />
          </Container>,
        ],
      }));
      setSendEmailTableRows(allRows);
    } else {
      setSendEmailTableRows([]);
    }
  }, [sendEmailsList]);

  const searchEmailFromGal = useCallback((searchKeyword: string) => {
    searchGal(searchKeyword).then((data) => {
      const contactList = data?.cn;
      if (contactList) {
        let result: Array<any> = [];
        result = contactList.map((item: any): any => ({
          id: item?.id,
          name: item?._attrs?.email,
        }));
        setSearchGrantEmailResult(result);
      } else {
        setSearchGrantEmailResult([]);
      }
    });
  }, []);

  useSearchWithDebounce(sendEmailItem, searchEmailFromGal);

  const onAddSendEmail = useCallback(() => {
    if (sendEmailItem !== '') {
      const specialChars = /[ `'"<>,;]/;
      const allEmails: Array<any> = specialChars.test(sendEmailItem)
        ? getAllEmailFromString(sendEmailItem)
        : [sendEmailItem];
      if (allEmails !== null && allEmails !== undefined) {
        const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
        if (inValidEmailAddress && inValidEmailAddress.length > 0) {
          setIsShowSendEmailError(true);
          setSendEmailErrorMessage(
            t(
              'domain.distributionList.invalidEmailErrorMsg',
              'The account does not exist. Please check the spelling and try again.',
            ),
          );
        } else if (
          sendEmailsList.find(
            (s: any) =>
              s?.name === sendEmailItem &&
              s?.sendAcl ===
                (radioPermisionValue === 'sendAs'
                  ? 'sendAsDistList'
                  : 'sendOnBehalfOfDistList'),
          )
        ) {
          setIsShowSendEmailError(true);
          setSendEmailErrorMessage(
            t(
              'label.distribution_list_already_in_list_error',
              'The Distribution List / User is already in the list',
            ),
          );
        } else {
          setIsShowSendEmailError(false);
          setSendEmailItem('');
          allEmails.forEach((item: any, index: any) => {
            if (radioPermisionValue === 'sendAs') {
              allEmails[index] = { name: item, sendAcl: 'sendAsDistList' };
            } else if (radioPermisionValue === 'sendOnBehalfOf') {
              allEmails[index] = { name: item, sendAcl: 'sendOnBehalfOfDistList' };
            }
          });
          const sortedList = sortedUniq(allEmails);
          const newSenders = sortedList.filter(
            (item: any) =>
              !sendEmailsList.find(
                (s: any) => s?.name === item?.name && s?.sendAcl === item?.sendAcl,
              ),
          );
          if (newSenders.length === 0) return;
          setIsRequestInProgress(true);
          const addRequests = newSenders.map((item: any) => {
            const dl: any = {
              by: 'id',
              _content: selectedMailingList?.id,
            };
            const action: any = {
              op: 'grantRights',
              right: {
                right: item?.sendAcl,
                grantee: {
                  by: 'name',
                  type: 'email',
                  _content: item?.name,
                },
              },
            };
            return distributionListAction(dl, action);
          });
          Promise.all(addRequests)
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
                const updatedEmails = uniq(sendEmailsList.concat(newSenders));
                setSendEmailsList(updatedEmails);
                setSendEmails(updatedEmails);
                setPreviousDetail((prevState: any) => ({
                  ...prevState,
                  sendEmailsList: updatedEmails,
                }));
                createSnackbar({
                  key: 'success',
                  severity: 'success',
                  label: t(
                    'label.sender_added_successfully',
                    'Authorized sender has been added successfully',
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
                  : t(
                      'label.something_wrong_error_msg',
                      'Something went wrong. Please try again.',
                    ),
                autoHideTimeout: 3000,
                hideButton: true,
                replace: true,
              });
              setIsRequestInProgress(false);
            });
        }
      } else if (allEmails === undefined) {
        setIsShowSendEmailError(true);
        setSendEmailErrorMessage(
          t(
            'domain.distributionList.invalidEmailErrorMsg',
            'The account does not exist. Please check the spelling and try again.',
          ),
        );
      }
    }
  }, [sendEmailItem, createSnackbar, t, sendEmailsList, radioPermisionValue, selectedMailingList?.id, setSendEmailsList, setSendEmails, setPreviousDetail, setIsRequestInProgress]);

  const closeDeleteSendEmailHandler = useCallback(() => {
    setIsOpenDeleteSendEmailDialog(false);
    setSendEmailToDelete(null);
  }, []);

  const onDeleteSendEmailConfirm = useCallback(() => {
    if (!sendEmailToDelete) return;
    setIsRequestInProgress(true);
    const dl: any = {
      by: 'id',
      _content: selectedMailingList?.id,
    };
    const action: any = {
      op: 'revokeRights',
      right: {
        right: sendEmailToDelete?.sendAcl,
        grantee: {
          by: 'name',
          type: 'email',
          _content: sendEmailToDelete?.name,
        },
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
          const updatedEmails = sendEmailsList.filter(
            (item: any) =>
              !(
                item?.name === sendEmailToDelete?.name &&
                item?.sendAcl === sendEmailToDelete?.sendAcl
              ),
          );
          setSendEmailsList(updatedEmails);
          setSendEmails(updatedEmails);
          setSelectedSendEmail([]);
          setPreviousDetail((prevState: any) => ({
            ...prevState,
            sendEmailsList: updatedEmails,
          }));
          createSnackbar({
            key: 'success',
            severity: 'success',
            label: t(
              'label.sender_deleted_successfully',
              'Authorized sender has been removed successfully',
            ),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        }
        setIsRequestInProgress(false);
        closeDeleteSendEmailHandler();
      })
      .catch((error: any) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t(
                'label.something_wrong_error_msg',
                'Something went wrong. Please try again.',
              ),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        setIsRequestInProgress(false);
        closeDeleteSendEmailHandler();
      });
  }, [
    sendEmailToDelete,
    selectedMailingList?.id,
    sendEmailsList,
    createSnackbar,
    t,
    closeDeleteSendEmailHandler,
    setSendEmailsList,
    setSendEmails,
    setPreviousDetail,
    setIsRequestInProgress,
  ]);

  const closeEditPermissionHandler = useCallback(() => {
    setIsOpenEditPermissionDialog(false);
  }, []);

  return (
    <>
      <Container
        padding={{ left: 'large', right: 'large' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 6rem)"
        background="white"
        width={'58.75rem'}
        style={{ overflow: 'auto' }}
      >
        <Row
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="vertical"
          padding={{ bottom: 'medium', top: 'medium' }}
        >
          <Text size="medium" color="gray0" weight="bold">
            {t(`domain.distributionList.managePermission`, `Manage permissions`)}
          </Text>
          <Text
            size="small"
            color="secondary"
            style={{ marginTop: '0.5rem' }}
            overflow="break-word"
          >
            {t(
              'domain.distributionList.sendAs.managePermission_description_msg',
              'Allow others to send emails as this distribution list',
            )}
          </Text>
        </Row>
        <Container padding={{ bottom: 'large' }} height={'auto'}>
          <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
            <DropDownInput
              items={sendItems}
              inputLabel={t(
                'domain.distributionList.sendAs.addSendersByEmail',
                'Add senders by email address',
              )}
              size="medium"
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                setSendEmailItem(e.target.value);
              }}
              inputValue={sendEmailItem}
              isCustomIcon={false}
              hasError={isShowSendEmailError}
            />
          </Row>
          {isShowSendEmailError && (
            <Row
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              width="100%"
              padding={{ top: 'small' }}
            >
              <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
                <Padding right={'0'}>
                  <Text size="extrasmall" weight="regular" color="error">
                    {sendEmailErrorMessage}
                  </Text>
                </Padding>
              </Container>
            </Row>
          )}
          <Container mainAlignment="flex-start">
            <Row width="100%" padding={{ top: 'extralarge' }} mainAlignment="flex-start">
              <Text size="small" color="gray0" weight="bold">
                {t('domain.distributionList.sendAs.permissionLevel', 'Permission level')}
              </Text>
            </Row>
            <Row
              width="100%"
              padding={{ top: 'large', bottom: 'large' }}
              mainAlignment="flex-start"
            >
              <RadioGroup
                value={radioPermisionValue}
                onChange={(value: string | undefined): void => {
                  if (value) setRadioPermisionValue(value);
                }}
              >
                <Radio
                  key="sendAs"
                  label={t('domain.distributionList.sendAs.sendAs', 'Send As')}
                  value="sendAs"
                  iconColor="primary"
                />
                <Text
                  key="sendAs-description"
                  size="small"
                  color="secondary"
                  style={{ marginBottom: '1rem', marginLeft: '1.8rem' }}
                >
                  {t(
                    'domain.distributionList.sendAs.permissionLevelSendMsg',
                    'Allows a user to send emails that appear to come directly from a distribution list, with no indication of who actually sent it',
                  )}
                </Text>
                <Radio
                  key="sendOnBehalfOf"
                  label={t(
                    'domain.distributionList.sendAs.sendOnBehalfOf',
                    'Send on behalf of',
                  )}
                  value="sendOnBehalfOf"
                  iconColor="primary"
                />
                <Text
                  key="sendOnBehalfOf-description"
                  size="small"
                  color="secondary"
                  style={{ marginBottom: '1rem', marginLeft: '1.8rem' }}
                >
                  {t(
                    'domain.distributionList.sendAs.permissionLevelSendOnBehalfOfMsg',
                    'Allows a user to send an email where the recipient sees e.g. "name.surname@mail.com on behalf of a distribution list"',
                  )}
                </Text>
              </RadioGroup>
            </Row>
          </Container>
          <Container mainAlignment="flex-start">
            <Row
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              width="100%"
              padding={{ bottom: 'large' }}
            >
              <Button
                icon="Plus"
                key="add-button"
                label={t('domain.distributionList.sendAs.addAccount', 'ADD ACCOUNT')}
                color="primary"
                iconPlacement="left"
                onClick={(): void => onAddSendEmail()}
                size="medium"
                disabled={!radioPermisionValue || !sendEmailItem?.length}
              />
            </Row>
          </Container>
          <Row width="100%" padding={{ top: 'medium' }}>
            <divider-wc color="gray2" />
          </Row>

          <ListRow>
            <Container padding={{ bottom: 'large', top: 'extralarge' }}>
              <Row
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ bottom: 'large' }}
                width="100%"
              >
                <Text weight="bold" color="gray0">
                  {t(
                    'domain.distributionList.sendAs.authorizedSenders',
                    'Authorized senders from this distribution list',
                  )}
                </Text>
              </Row>
              {sendEmailTableRows.length > 0 && (
                <ListRow>
                  <Row width="100%" mainAlignment="flex-start" padding={{ bottom: 'large' }}>
                    <Input
                      label={t(
                        'domain.distributionList.sendAs.searchSenders',
                        'Search senders',
                      )}
                      value={filterSendEmail}
                      backgroundColor="gray5"
                      onChange={handleInputChangeSendEmail}
                      CustomIcon={(): any => (
                        <icon-wc icon="FunnelOutline" size="large" color="primary"></icon-wc>
                      )}
                    />
                  </Row>
                </ListRow>
              )}
              <Table
                rows={filterSendEmail ? filteredSendEmailRows : sendEmailTableRows}
                headers={sendEmailHeaders}
                showCheckbox={false}
                selectedRows={selectedSendEmail}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
            </Container>
          </ListRow>

          {sendEmailTableRows.length === 0 && (
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
                    <Text size="large" color="secondary" weight="regular">
                      {t('label.there_are_not_member_here', "There aren't members here.")}
                    </Text>
                  </Row>
                  <Row mainAlignment="center" width="100%">
                    <Text size="large" color="secondary" weight="regular">
                      {searchUserLabelValue}
                    </Text>
                  </Row>
                </Padding>
              </Container>
            </ListRow>
          )}
        </Container>
      </Container>
      {isOpenEditPermissionDialog && (
        <Modal
          size="small"
          title={t(
            'domain.distributionList.sendAs.editPermissionLevel',
            'Edit permission level',
          )}
          open={isOpenEditPermissionDialog}
          customFooter={
            <Container orientation="horizontal" mainAlignment="flex-end">
              <Row style={{ gap: '1rem' }}>
                <Button
                  key={'modal-cancel-button'}
                  label={t('label.cancel', 'Cancel')}
                  color="secondary"
                  type="outlined"
                  onClick={closeEditPermissionHandler}
                  disabled={isRequestInProgress}
                />
                <Button
                  key={'modal-save-button'}
                  label={t(
                    'domain.distributionList.sendAs.saveChanges',
                    'SAVE CHANGES',
                  )}
                  color="primary"
                  onClick={(): void => {
                    if (editingEmailItem) {
                      const newAcl =
                        editPermissionValue === 'sendAs'
                          ? 'sendAsDistList'
                          : 'sendOnBehalfOfDistList';
                      if (editingEmailItem?.sendAcl === newAcl) {
                        setEditingEmailItem(null);
                        setIsOpenEditPermissionDialog(false);
                        return;
                      }
                      if (
                        sendEmailsList.find(
                          (s: any) =>
                            s?.name === editingEmailItem?.name && s?.sendAcl === newAcl,
                        )
                      ) {
                        createSnackbar({
                          key: 'error',
                          severity: 'error',
                          label: t(
                            'label.distribution_list_already_in_list_error',
                            'The Distribution List / User is already in the list',
                          ),
                          autoHideTimeout: 3000,
                          hideButton: true,
                          replace: true,
                        });
                        return;
                      }
                      setIsRequestInProgress(true);
                      const dl: any = { by: 'id', _content: selectedMailingList?.id };
                      const revokeAction: any = {
                        op: 'revokeRights',
                        right: {
                          right: editingEmailItem?.sendAcl,
                          grantee: {
                            by: 'name',
                            type: 'email',
                            _content: editingEmailItem?.name,
                          },
                        },
                      };
                      const grantAction: any = {
                        op: 'grantRights',
                        right: {
                          right: newAcl,
                          grantee: {
                            by: 'name',
                            type: 'email',
                            _content: editingEmailItem?.name,
                          },
                        },
                      };
                      distributionListAction(dl, revokeAction)
                        .then((revokeRes: any) => {
                          if (revokeRes?.Fault) {
                            throw new Error(revokeRes?.Fault?.Reason?.Text);
                          }
                          return distributionListAction(dl, grantAction);
                        })
                        .then((grantRes: any) => {
                          if (grantRes?.Fault) {
                            throw new Error(grantRes?.Fault?.Reason?.Text);
                          }
                          const updatedList = sendEmailsList.map((item: any) =>
                            item?.name === editingEmailItem?.name
                              ? { ...item, sendAcl: newAcl }
                              : item,
                          );
                          setSendEmailsList(updatedList);
                          setSendEmails(updatedList);
                          setPreviousDetail((prevState: any) => ({
                            ...prevState,
                            sendEmailsList: updatedList,
                          }));
                          createSnackbar({
                            key: 'success',
                            severity: 'success',
                            label: t(
                              'label.permission_updated_successfully',
                              'Permission level has been updated successfully',
                            ),
                            autoHideTimeout: 3000,
                            hideButton: true,
                            replace: true,
                          });
                          setEditingEmailItem(null);
                          setIsOpenEditPermissionDialog(false);
                          setIsRequestInProgress(false);
                        })
                        .catch((error: any) => {
                          createSnackbar({
                            key: 'error',
                            severity: 'error',
                            label: error?.message
                              ? error?.message
                              : t(
                                  'label.something_wrong_error_msg',
                                  'Something went wrong. Please try again.',
                                ),
                            autoHideTimeout: 3000,
                            hideButton: true,
                            replace: true,
                          });
                          setIsRequestInProgress(false);
                        });
                    }
                  }}
                  disabled={isRequestInProgress}
                />
              </Row>
            </Container>
          }
          showCloseIcon
          onClose={closeEditPermissionHandler}
        >
          <RadioGroup
            value={editPermissionValue}
            onChange={(value: string | undefined): void => {
              if (value) setEditPermissionValue(value);
            }}
            style={{marginTop:'1rem', marginBottom:'0.5rem'}}
          >
            <Radio
              key={'send-as-option'}
              label={t('domain.distributionList.sendAs.sendAs', 'Send As')}
              value="sendAs"
              iconColor="primary"
              padding={{ bottom: 'large' }}
            />
            <Radio
              key={'send-on-behalf-of-option'}
              label={t('domain.distributionList.sendAs.sendOnBehalfOf', 'Send on behalf of')}
              value="sendOnBehalfOf"
              iconColor="primary"
            />
          </RadioGroup>
        </Modal>
      )}
      {isOpenDeleteSendEmailDialog && (
        <Modal
          size="small"
          title={t('domain.distributionList.sendAs.removeAuthorizedSender', 'Remove authorized sender')}
          open={isOpenDeleteSendEmailDialog}
          customFooter={
            <Container orientation="horizontal" mainAlignment="flex-end">
              <Row style={{ gap: '1rem' }}>
                <Button
                  label={t('domain.distributionList.NoCancel', 'NO, CANCEL')}
                  color="gray0"
                  type="outlined"
                  onClick={closeDeleteSendEmailHandler}
                  disabled={isRequestInProgress}
                />
                <Button
                  label={t('domain.distributionList.yesRemoveIt', 'YES, REMOVE IT')}
                  color="error"
                  onClick={onDeleteSendEmailConfirm}
                  disabled={isRequestInProgress}
                />
              </Row>
            </Container>
          }
          showCloseIcon
          onClose={closeDeleteSendEmailHandler}
        >
          <Container
            padding={{ top: 'extralarge', bottom: 'extralarge' }}
            mainAlignment="flex-start"
          >
            <Text size={'large'} overflow="break-word">
              <Trans
                i18nKey="domain.distributionList.sendAs.removeAuthorizedSenderMsg"
                defaults="Are you sure you want to remove <bold>{{name}}</bold> with permission level <bold>{{permission}}</bold> from the list?"
                components={{ bold: <strong /> }}
                values={{
                  name: sendEmailToDelete?.name,
                  permission: sendEmailToDelete?.sendAcl === 'sendAsDistList'
                    ? t('domain.distributionList.sendAs.sendAs', 'Send As')
                    : t('domain.distributionList.sendAs.sendOnBehalfOf', 'Send on behalf of'),
                }}
              />
            </Text>
          </Container>
        </Modal>
      )}
    </>
  );
};
