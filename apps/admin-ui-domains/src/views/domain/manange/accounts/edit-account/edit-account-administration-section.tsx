/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  CustomHeaderFactory,
  Dropdown,
  HoverableRowFactory,
  Input,
  Padding,
  Row,
  Select,
  Switch,
  Table,
  useSnackbar,
} from '@zextras/ui-components';
import { searchDirectory, useIsAdvanced, useUserSettings } from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DISPLAYNAME, FETCH_DATA_LIMIT, TRUE } from '../../../../../constants';
import { addDistributionListMember } from '../../../../../services/add-distributionlist-member-service';
import { getAccountMembershipRequest } from '../../../../../services/get-account-membership';
import {
  getInitializedDomains,
  GetInitializedDomainsResponse,
} from '../../../../../services/get-initialized-domains';
import { removeDistributionListMember } from '../../../../../services/remove-distributionlist-member-service';
import { generateSnackbarFromError } from '../../../../error/generate-snackbar-error';
import { useAccountForm, useSetAccountValues } from './account-form-context';

const EditAccountAdministrationSection: FC<any> = ({ setIsLoading }) => {
  const createSnackbar = useSnackbar();
  const { form, savedValues } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const accountDetail = values;
  const initAccountDetail = savedValues as Record<string, any>;
  const [isDomainSelect, setIsDomainSelect] = useState(false);
  const [searchDomainName, setSearchDomainName] = useState('');
  const [domainList, setDomainList] = useState<Array<{ id: string; name: string }>>([]);
  const [distributionList, setDistributionList] = useState<any>([]);
  const [accountDistributionList, setAccountDistributionList] = useState([]);
  const [domainId, setDomainId] = useState('');
  const [sendSelectedRows, setSendSelectedRows] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>([]);

  const isAdvanced = useIsAdvanced();
  const userSetting = useUserSettings();
  const [t] = useTranslation();

  const isGlobalAdmin = useMemo(
    () => userSetting?.attrs?.zimbraIsAdminAccount === TRUE,
    [userSetting?.attrs],
  );

  const headers: any = useMemo(
    () => [
      {
        id: 'rights',
        label: t('label.rights_access_control_lists', 'Rights (Access Control Lists)'),
        width: '48%',
        bold: true,
      },
      {
        id: 'domain',
        label: t('label.domain', 'Domain'),
        width: '48%',
        bold: true,
      },
    ],
    [t],
  );

  const options =
    distributionList?.length > 0
      ? distributionList?.map((group: any) => ({
          label:
            group?.a?.find((item: Record<string, string>) => item?.n === DISPLAYNAME)?._content ||
            group.name,
          value: group.id,
        }))
      : [];

  const onOptionChange = (v: any): any => {
    const it = options.find((item: any) => item.value === v);
    setSelectedOption(it);
  };

  const changeSwitchOption = useCallback(
    (key: string): void => {
      setAccountValues((prev: Record<string, any>) => ({
        ...prev,
        [key]: prev[key] === 'TRUE' ? 'FALSE' : 'TRUE',
      }));
    },
    [setAccountValues],
  );

  const getAccountDistributionList = useCallback(() => {
    getAccountMembershipRequest(accountDetail?.zimbraId).then((res) => {
      const lists = res?.dl?.filter(
        (list: any) =>
          list.a &&
          list?.via === undefined &&
          list?.a?.some((item: any) => item.n === 'zimbraIsAdminGroup' && item._content === 'TRUE'),
      );
      setAccountDistributionList(lists);
    });
  }, [accountDetail?.zimbraId]);

  const onAdd = useCallback((): void => {
    setIsLoading(true);
    const id: any = {
      n: 'id',
      _content: selectedOption.value,
    };
    const dlmItem: any = {
      n: 'dlm',
      _content: accountDetail?.name,
    };
    addDistributionListMember(id, dlmItem)
      .then((data) => {
        if (data) {
          createSnackbar({
            key: 'success',
            severity: 'success',
            label: t(
              'label.the_last_changes_has_been_saved_successfully',
              'Changes have been saved successfully',
            ),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
          getAccountDistributionList();
          setIsLoading(false);
        }
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
        setIsLoading(false);
      });
  }, [
    setIsLoading,
    selectedOption.value,
    accountDetail?.name,
    createSnackbar,
    t,
    getAccountDistributionList,
  ]);

  const fetchDistributionList = (name: string): void => {
    const attrs =
      'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount';
    const types = 'distributionlists,dynamicgroups';
    const query = `zimbraIsAdminGroup=TRUE`;
    searchDirectory({ attr: attrs, type: types, domainName: name || '', query, offset: 0, limit: FETCH_DATA_LIMIT, sortBy: 'name' })
      .then((res) => {
        setDistributionList(res?.dl);
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
      });
  };

  const tableRows = useMemo(
    () =>
      accountDistributionList?.map((v: any, i) => ({
        id: v.id,
        columns: [
          <ds-text key={i} weight="light" as="span">
            {v.name.replace(new RegExp('__', 'g'), '').split('@')[0]}
          </ds-text>,
          <ds-text color="text" key={i} weight="light" as="span">
            {v.name.replace(new RegExp('__', 'g'), '').split('@')[1]}
          </ds-text>,
        ],
        clickable: true,
      })),
    [accountDistributionList],
  );

  const items = domainList?.map((domain: any) => ({
    id: domain.id,
    label: domain.name,
    customComponent: (
      <Row
        style={{
          display: 'block',
          textAlign: 'left',
          height: 'inherit',
          padding: '0.3rem',
          width: '100%',
        }}
        onClick={(): void => {
          setDomainId(domain?.id);
          setSearchDomainName(domain?.name);
          setIsDomainSelect(true);
          fetchDistributionList(domain?.name);
        }}
      >
        {domain?.name}
      </Row>
    ),
  }));

  const onDeleteFromList = useCallback(
    (lists: any, type: string) => {
      if (lists?.length > 0) {
        setIsLoading(true);
        lists.forEach((item: any) => {
          const id: any = {
            n: 'id',
            _content: type === 'all' ? item.id : item,
          };
          const dlmItem: any = {
            n: 'dlm',
            _content: accountDetail?.name,
          };
          removeDistributionListMember(id, dlmItem)
            .then((data) => {
              if (data) {
                createSnackbar({
                  key: 'success',
                  severity: 'success',
                  label: t(
                    'account_details.right_for_selected_user_deleted_successfully',
                    'Right for selected user deleted successfully',
                  ),
                  autoHideTimeout: 3000,
                  hideButton: true,
                  replace: true,
                });
                getAccountDistributionList();
                setIsLoading(false);
              }
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
              setIsLoading(false);
            });
        });
      }
      setSendSelectedRows([]);
    },
    [setIsLoading, accountDetail?.name, createSnackbar, t, getAccountDistributionList],
  );

  function setDomains(response: GetInitializedDomainsResponse): void {
    if (response.searchTotal > 0) {
      setDomainList(response.domain);
    } else {
      setDomainList([]);
    }
  }

  const getInitializedDomainLists = useCallback(
    (domain: string) => {
      getInitializedDomains({ domainName: domain })
        .then((response) => {
          setDomains(response);
        })
        .catch((error) => {
          const snackbarConfig = generateSnackbarFromError(error, t);
          createSnackbar(snackbarConfig);
        });
    },
    [createSnackbar, t],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchDomainCall = useCallback(
    debounce((domain) => {
      getInitializedDomainLists(domain);
    }, 700),
    [debounce],
  );

  useEffect(() => {
    if (!isDomainSelect && isAdvanced) {
      searchDomainCall(searchDomainName);
    }
  }, [searchDomainName, isDomainSelect, searchDomainCall, isAdvanced]);

  useEffect(() => {
    if (isAdvanced) {
      getInitializedDomainLists('');
    }
    getAccountDistributionList();
  }, [getInitializedDomainLists, getAccountDistributionList, accountDetail?.name, isAdvanced]);

  return (
    <Container
      mainAlignment="flex-start"
      padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
      style={{ overflow: 'auto' }}
    >
      <Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.roles', 'Roles')}
          </ds-text>
        </Row>
        {isGlobalAdmin && (
          <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="flex-start">
            <Row width="40%" padding={{ top: 'large' }} mainAlignment="flex-start">
              <Switch
                value={accountDetail?.zimbraIsAdminAccount === 'TRUE'}
                onClick={(): void => {
                  if (accountDetail?.zimbraIsAdminAccount === 'FALSE') {
                    form.setFieldValue('deleteAdministrationRights', accountDistributionList);
                  } else {
                    form.setFieldValue('deleteAdministrationRights', []);
                  }
                  changeSwitchOption('zimbraIsAdminAccount');
                  setAccountValues((prev: Record<string, any>) => ({
                    ...prev,
                    zimbraIsDelegatedAdminAccount:
                      initAccountDetail?.zimbraIsDelegatedAdminAccount,
                  }));
                }}
                label={t('account_details.global_administration', 'Global administration')}
                iconColor="primary"
              />
            </Row>
          </Row>
        )}

        {isAdvanced && (
          <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="flex-start">
            <Row width="40%" mainAlignment="flex-start">
              {accountDetail?.zimbraIsAdminAccount !== 'TRUE' && (
                <Switch
                  disabled={accountDetail?.zimbraIsAdminAccount === 'TRUE'}
                  value={accountDetail?.zimbraIsDelegatedAdminAccount === 'TRUE'}
                  onClick={(): void => changeSwitchOption('zimbraIsDelegatedAdminAccount')}
                  label={t('account_details.delegated_administration', 'Delegated administration')}
                  iconColor="primary"
                />
              )}
            </Row>
          </Row>
        )}
        {isAdvanced &&
          accountDetail?.zimbraIsAdminAccount !== 'TRUE' &&
          accountDetail?.zimbraIsDelegatedAdminAccount === 'TRUE' && (
            <Row
              width="100%"
              mainAlignment="flex-start"
              padding={{ top: 'large', bottom: 'large' }}
            >
              <Row
                width="45%"
                padding={{ top: 'large', right: 'large' }}
                mainAlignment="flex-start"
              >
                <Dropdown
                  items={items}
                  placement="bottom-start"
                  disableAutoFocus
                  width="100%"
                  style={{
                    width: '100%',
                  }}
                >
                  <Input
                    label={t('label.domain', 'Domain')}
                    onChange={(ev: any): void => {
                      setIsDomainSelect(false);
                      setDomainId('');
                      setSearchDomainName(ev.target.value);
                    }}
                    value={searchDomainName}
                    backgroundColor="gray5"
                  />
                </Dropdown>
              </Row>
              <Row
                width="45%"
                padding={{ top: 'large', right: 'large' }}
                mainAlignment="flex-start"
              >
                <Select
                  disabled={options?.length < 1}
                  items={options}
                  background="gray5"
                  label={t('label.rights_access_control_lists', 'Rights (Access Control Lists)')}
                  showCheckbox={false}
                  selection={selectedOption}
                  onChange={onOptionChange}
                />
              </Row>
              <Padding top="large" right="small">
                <Button
                  label={t('label.add', 'Add')}
                  onClick={onAdd}
                  disabled={domainId === '' || selectedOption?.length === 0}
                  type="outlined"
                  color="primary"
                  size="extralarge"
                />
              </Padding>
            </Row>
          )}
      </Row>
      {accountDistributionList?.length > 0 &&
        accountDetail?.zimbraIsAdminAccount !== 'TRUE' &&
        accountDetail?.zimbraIsDelegatedAdminAccount === 'TRUE' && (
          <>
            <Row width="100%" padding={{ top: '2rem' }}>
              <ds-divider></ds-divider>
            </Row>
            <Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
              <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
                <ds-text size="small" color="gray0" weight="bold" as="h2">
                  {t(
                    'label.This account has Administration rights for',
                    'This account has Administration rights for',
                  )}
                </ds-text>
              </Row>
            </Row>
            <Row
              width="100%"
              mainAlignment="flex-start"
              crossAlignment="center"
              padding={{ top: 'large' }}
            >
              <Table
                rows={tableRows}
                headers={headers}
                showCheckbox={false}
                onSelectionChange={setSendSelectedRows}
                multiSelect={false}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
            </Row>
            <Row
              width="100%"
              mainAlignment="flex-start"
              crossAlignment="center"
              padding={{ top: 'large', bottom: '3rem' }}
            >
              <Row padding={{ right: 'small' }} width="49%">
                <Padding all={'0'}>
                  <Button
                    disabled={sendSelectedRows?.length < 1}
                    type="ghost"
                    onClick={(): void => onDeleteFromList(sendSelectedRows, 'one')}
                    label={t('label.remove', 'REMOVE')}
                    color="error"
                    width="fill"
                  />
                </Padding>
              </Row>

              <Row width="49%">
                <Button
                  type="outlined"
                  label={t('label.remove_all', 'REMOVE ALL')}
                  onClick={(): void => onDeleteFromList(accountDistributionList, 'all')}
                  color="error"
                  width="fill"
                />
              </Row>
            </Row>
          </>
        )}
    </Container>
  );
};

export default EditAccountAdministrationSection;
