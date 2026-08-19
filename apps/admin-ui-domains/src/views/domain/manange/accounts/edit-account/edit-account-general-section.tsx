/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Button, ChipInput, Container, CustomHeaderFactory, CustomTextArea, DropDownInput, HoverableRowFactory, InheritedSelect, Input, LabeledValue, Modal, Padding, Paging, Row, Select, Switch, Table, Tooltip, useSnackbar, } from '@zextras/ui-components';
import { useCosList, useIsAdvanced } from '@zextras/ui-shared';
import { debounce, map } from 'lodash-es';
import React, {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Attribute, objectType } from '../../../../../../types';
import { ADMINISTRATION, DEFAULT, MAX_DOMAIN_DISPLAY } from '../../../../../constants';
import { useSelectedDomain } from '../../../../../hooks/use-selected-domain';
import { domainQueryKeys } from '../../../../../services/domain-query-keys';
import { endSession } from '../../../../../services/end-session';
import { getDelegateAuthRequest } from '../../../../../services/get-delegate-auth-request';
import { modifyAccountRequest } from '../../../../../services/modify-account';
import { getDomainList } from '../../../../../services/search-domain-service';
import CustomChip from '../../../../components/customChip';
import ManageAliases from '../../../../components/manageAliases';
import { generateSnackbarFromError } from '../../../../error/generate-snackbar-error';
import {
  ABQStatus,
  AccountStatus,
  backupEnabledStatus,
  formatZimbraDate,
  localeList,
} from '../../../../utility/utils';
import { useAccountForm, useSetAccountValues } from './account-form-context';
import { EditAccountQuotaBar } from './parts/edit-account-quota-bar';
import { EditAccountQuotaInputs } from './parts/edit-account-quota-inputs';

type UserSession = {
  name: string;
  sid: string;
  zid: string;
  ip: string;
  service: string;
};

const ZimbraAuthMethod = {
  INTERNAL: 'zimbra',
  LDAP: 'ldap',
  EXTERNAL: 'ad',
} as const;

export const EditAccountGeneralSection: FC<{
  setChange: any;
  onQuotaErrorChange: (hasError: boolean) => void;
}> = ({ setChange, onQuotaErrorChange }) => {
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const {
    form,
    cosDetail,
    accSpecificDetail,
    otpList,
    directMemberList,
    inDirectMemberList,
    sessions,
    allowedDeletePassword,
    savedValues,
    account,
  } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const { data: domain } = useSelectedDomain();
  const domainInformation = domain?.a;
  const domainName = domain?.name;
  const { data: cosData } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const cosList = cosData?.cos ?? [];
  const [t] = useTranslation();
  const localeZone = useMemo(() => localeList(t), [t]);
  const ACCOUNT_STATUS: Array<{ value: string; label: string }> = useMemo(
    () => AccountStatus(t),
    [t],
  );
  const ABQ_STATUS = useMemo(() => ABQStatus(t), [t]);
  const BACKUP_ENABLED_STATUS = useMemo(() => backupEnabledStatus(t), [t]);
  const [cosItems, setCosItems] = useState<any[]>([]);
  const [accountAliases, setAccountAliases] = useState<any[]>([]);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState<boolean>(false);
  const [domainList, setDomainList] = useState([]);
  const [isDomainSelect, setIsDomainSelect] = useState(false);
  const [searchDomainName, setSearchDomainName] = useState(domainName);
  const [sessionListRows, setSessionListRows] = useState<Array<any>>([]);
  const [selectedSession, setSelectedSession] = useState<any>([]);
  const [sessionFilter, setSessionFilter] = useState('');
  const [endedSids, setEndedSids] = useState<Array<string>>([]);
  const allUserSessionList = sessions.filter(
    (item: UserSession) => !endedSids.includes(item?.sid),
  );
  const userSessionList = sessionFilter
    ? allUserSessionList.filter(
        (item: UserSession) =>
          item?.name.includes(sessionFilter) || item?.sid.includes(sessionFilter),
      )
    : allUserSessionList;
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const isAdvanced = useIsAdvanced();
  const [defaultCosId, setDefaultCosId] = useState('');
  const [defaultCOS, setDefaultCOS] = useState<boolean>(false);
  const [cosDefaultStateSet, setCosDefaultStateSet] = useState<boolean>(false);

  const sessionTableHeader: any[] = useMemo(() => {
    const accountsLabel = t('label.accounts', 'Accounts');
    const sessionIdLabel = t('label.session_id', 'Session ID');
    const ipLabel = t('label.ip', 'IP');
    const serviceLabel = t('label.service', 'Service');

    return [
      { id: 'accounts', label: accountsLabel, width: '25%', bold: true },
      { id: 'session_id', label: sessionIdLabel, width: '25%', bold: true },
      { id: 'ip', label: ipLabel, width: '25%', bold: true },
      { id: 'service', label: serviceLabel, width: '25%', bold: true },
    ];
  }, [t]);

  const isHidePassword = useMemo(() => {
    if (!!domainInformation && domainInformation.length > 0) {
      const obj: objectType = {};
      domainInformation.forEach((item: Attribute) => {
        obj[item?.n] = item._content;
      });
      if (
        obj?.zimbraAuthMech === ZimbraAuthMethod.LDAP &&
        obj.zimbraAuthFallbackToLocal !== 'TRUE'
      ) {
        return true;
      }
    }
    return false;
  }, [domainInformation]);

  const extLdapAuth = useMemo(() => {
    if (!!domainInformation && domainInformation?.length > 0) {
      const obj: objectType = {};
      domainInformation?.forEach((item: Attribute) => {
        obj[item?.n] = item._content;
      });
      if (obj?.zimbraAuthLdapURL !== undefined && obj?.zimbraAuthLdapURL !== '') {
        return true;
      }
    }
    return false;
  }, [domainInformation]);

  const getDomainLists = useCallback(
    (domain: string | undefined): void => {
      getDomainList(domain, 0)
        .then((data) => {
          const searchResponse = data;
          if (!!searchResponse && searchResponse?.searchTotal > 0) {
            setDomainList(searchResponse?.domain);
          } else {
            setDomainList([]);
          }
        })
        .catch((error) => {
          const snackbarConfig = generateSnackbarFromError(error, t);
          createSnackbar(snackbarConfig);
        });
    },
    [createSnackbar, t],
  );

  const selectedDomain = useCallback(
    (domain: string) => {
      setIsDomainSelect(true);
      setSearchDomainName(domain);
      form.setFieldValue('domainName', domain);
    },
    [form],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchDomainCall = useCallback(
    debounce((domain) => {
      getDomainLists(domain);
    }, 700),
    [debounce],
  );

  useEffect(() => {
    if (!isDomainSelect) {
      searchDomainCall(searchDomainName);
    }
  }, [searchDomainName, isDomainSelect, searchDomainCall]);

  const changeSwitchOption = useCallback(
    (key: string): void => {
      setAccountValues((prev: Record<string, any>) => ({
        ...prev,
        [key]: prev[key] === 'TRUE' ? 'FALSE' : 'TRUE',
      }));
    },
    [setAccountValues],
  );
  const changeAccDetail = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAccountValues((prev: Record<string, any>) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [setAccountValues],
  );
  const changeUserNaneDetail = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAccountValues((prev: Record<string, any>) => ({
        ...prev,
        uid: e.target.value?.replaceAll(' ', '')?.toLowerCase(),
      }));
    },
    [setAccountValues],
  );

  useEffect(() => {
    if (values?.mail) {
      const aliaes = values.mail.split(', ').map((ele: string) => ({ label: ele }));
      setAccountAliases(aliaes);
    }
  }, [values?.mail]);

  useEffect(() => {
    if (!!cosList && cosList.length > 0) {
      const arrayItem: any[] = [];
      cosList.forEach((item: any) => {
        arrayItem.push({
          label: item.name,
          value: item.id,
        });
      });
      setCosItems(arrayItem);
    }
  }, [cosList]);

  useEffect(() => {
    if (values?.zimbraCOSId) {
      const cosId = cosItems.find((item: any) => item.label === DEFAULT);
      setDefaultCosId(cosId?.value);
      if (values?.zimbraCOSId === cosId?.value && !cosDefaultStateSet) {
        setDefaultCOS(true);
        setCosDefaultStateSet(true);
      }
    }
  }, [values, cosItems, defaultCOS, cosDefaultStateSet]);

  const selection = useMemo(
    () => cosItems.find((item: any) => item.value === values?.zimbraCOSId),
    [values, cosItems],
  );

  const onAccountStatusChange = (v: any): any => {
    form.setFieldValue('zimbraAccountStatus', v);
  };
  const onAccountABQStatusChange = (v: any): any => {
    form.setFieldValue('abqMode', v);
  };
  const onAccountBackupEnabledStatusChange = (v: any): any => {
    form.setFieldValue('backupEnabled', v);
  };
  const onPrefLocaleChange = (v: string): void => {
    if (v) form.setFieldValue('zimbraPrefLocale', v);
  };
  const onCOSIdChange = (v: any): void => {
    form.setFieldValue('zimbraCOSId', v);
  };
  const onCOSSwitchChanges = (): void => {
    if (!defaultCOS) {
      form.setFieldValue('zimbraCOSId', defaultCosId);
    } else {
      form.setFieldValue('zimbraCOSId', cosItems[0]?.value);
    }
    setDefaultCOS(!defaultCOS);
  };

  const deleteUserPassword = (): void => {
    setShowDeletePasswordModal(false);
    modifyAccountRequest(values?.zimbraId, { userPassword: '' })
      .then((data) => {
        setAccountValues((prev: Record<string, any>) => ({
          ...prev,
          userPassword: '',
          password: '',
          repeatPassword: '',
        }));
        void queryClient.invalidateQueries({
          queryKey: domainQueryKeys.accountDetail(account.id),
        });
        if (data) {
          createSnackbar({
            key: 'success',
            severity: 'success',
            label: t('account_details.user_password_deleted', 'User password deleted successfully'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
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
      });
  };

  const setEmptyValue = useCallback(
    (keyName: string) => {
      setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
    },
    [setAccountValues],
  );

  const items = useMemo(() => {
    if (domainList.length > MAX_DOMAIN_DISPLAY) {
      return [
        {
          customComponent: (
            <>
              <Row mainAlignment="flex-start">
                <Padding horizontal="small">
                  <ds-icon icon="InfoOutline" style={{ width: '20px', height: '20px' }}></ds-icon>
                </Padding>
              </Row>
              <Row mainAlignment="flex-start" width="100%" padding={{ all: 'small' }}>
                <ds-text as="p" overflow="break-word">
                  {t(
                    'many_domain_info_msg',
                    'So many domains! Which one would you like to see? Start typing to filter.',
                  )}
                </ds-text>
              </Row>
            </>
          ),
        },
      ];
    }

    return domainList.map((domain: objectType) => ({
      id: domain.id,
      label: domain.name,
      customComponent: (
        <Row
          style={{
            display: 'block',
            textAlign: 'left',
            height: 'inherit',
            padding: '3px',
            width: 'inherit',
          }}
          onClick={(): void => selectedDomain(domain?.name)}
        >
          {domain?.name}
        </Row>
      ),
    }));
  }, [domainList, selectedDomain, t]);

  useEffect(() => {
    selectedDomain(values?.domainName);
  }, [values?.domainName, selectedDomain]);

  useEffect(() => {
    if (domainName) {
      form.setFieldValue('domainName', domainName);
    }
    getDomainLists(domainName);
  }, [domainName, getDomainLists, form]);

  const accountUserType = useMemo((): string => {
    if (values?.zimbraIsAdminAccount === 'TRUE') return 'Admin';
    if (values?.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
    if (values?.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
    if (values?.zimbraIsSystemAccount === 'TRUE') return 'System';
    return 'Normal';
  }, [
    values?.zimbraIsAdminAccount,
    values?.zimbraIsDelegatedAdminAccount,
    values?.zimbraIsExternalVirtualAccount,
    values?.zimbraIsSystemAccount,
  ]);

  const addSelection = useCallback((item: UserSession) => {
    setSelectedSession([item?.sid]);
  }, []);

  const handleUserSessionListUpdate = useCallback(() => {
    const allRows = userSessionList.map((item: UserSession) => ({
      id: item?.sid,
      columns: [
        <Container
          crossAlignment="flex-start"
          key={item?.zid}
          style={{ cursor: 'pointer' }}
          onClick={(): void => addSelection(item)}
        >
          <ds-text as="span" size="small" weight="light" color="#828282">
            {item?.name}
          </ds-text>
        </Container>,
        <Container
          crossAlignment="flex-start"
          key={item?.zid}
          style={{ cursor: 'pointer' }}
          onClick={(): void => addSelection(item)}
        >
          <ds-text as="span" size="small" weight="light" key={item?.zid} color="#828282">
            {item?.sid}
          </ds-text>
        </Container>,
        <Container
          crossAlignment="flex-start"
          key={item?.zid}
          style={{ cursor: 'pointer' }}
          onClick={(): void => addSelection(item)}
        >
          <ds-text as="span" size="small" weight="light" key={item?.zid} color="#828282">
            {''}
          </ds-text>
        </Container>,
        <Container
          crossAlignment="flex-start"
          key={item?.zid}
          style={{ cursor: 'pointer' }}
          onClick={(): void => addSelection(item)}
        >
          <ds-text as="span" size="small" weight="light" key={item?.zid} color="#828282">
            {''}
          </ds-text>
        </Container>,
      ],
    }));
    setSessionListRows(allRows);
  }, [addSelection, userSessionList]);

  useEffect(() => {
    if (userSessionList && userSessionList.length > 0) {
      handleUserSessionListUpdate();
    } else {
      setSessionListRows([]);
    }
  }, [addSelection, handleUserSessionListUpdate, userSessionList]);

  const handleEndSessionError = useCallback(
    (error: { message?: string }): void => {
      setIsRequestInProgress(false);
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: error.message
          ? error.message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
    [createSnackbar, t],
  );
  const setUserSessionListState = useCallback((): void => {
    setEndedSids((prev) => [...prev, selectedSession[0]]);
  }, [selectedSession]);

  const handleEndSession = useCallback(
    (token: string) => {
      endSession(selectedSession[0], values?.name, token)
        .then((resp: any) => {
          if (!resp?._jsns) throw new Error('Session end failed');
          setUserSessionListState();
          setSelectedSession([]);
          createSnackbar({
            key: 'success',
            severity: 'success',
            label: t('label.session_end_success', 'Session end successfully'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        })
        .catch(handleEndSessionError);
    },
    [
      selectedSession,
      values?.name,
      handleEndSessionError,
      setUserSessionListState,
      createSnackbar,
      t,
    ],
  );

  const onEndSession = useCallback(() => {
    setIsRequestInProgress(true);
    getDelegateAuthRequest(values?.zimbraId)
      .then((res: any) => res?.authToken[0]?._content)
      .then(handleEndSession)
      .catch(handleEndSessionError)
      .finally(() => setIsRequestInProgress(false));
  }, [values?.zimbraId, handleEndSession, handleEndSessionError]);

  const onSessionFilterInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setSelectedSession([]);
      setSessionFilter(ev?.target?.value || '');
    },
    [],
  );

  const renderSwitchRow = (
    label: string,
    value: boolean,
    onClick: () => void,
  ): React.JSX.Element => (
    <Row width="69%" mainAlignment="flex-start">
      <Switch value={value} onClick={onClick} label={label} iconColor="primary" />
    </Row>
  );

  return (
    <Container
      mainAlignment="flex-start"
      padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
    >
      <Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text as="h2" size="small" color="gray0" weight="bold">
            {t('label.account', 'Account')}
          </ds-text>
        </Row>
        <Row padding={{ vertical: 'large', left: 'large' }} width="100%" mainAlignment="flex-start">
          <EditAccountQuotaBar />
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="32%" mainAlignment="space-between">
            <Input
              isRequired
              data-testid="surname-input"
              label={t('label.surname', 'Surname')}
              backgroundColor="gray5"
              onChange={changeAccDetail}
              inputName="sn"
              value={values?.sn || ''}
            />
          </Row>
          <Row width="32%" mainAlignment="space-between">
            <Input
              data-testid="middlename-input"
              label={t('label.second_name_initials', 'Middle Name Initials')}
              backgroundColor="gray5"
              onChange={changeAccDetail}
              inputName="initials"
              value={values?.initials || ''}
            />
          </Row>
          <Row width="32%" mainAlignment="space-between">
            <Input
              data-testid="name-input"
              label={t('label.person_name', 'Name')}
              backgroundColor="gray5"
              onChange={changeAccDetail}
              inputName="givenName"
              value={values?.givenName || ''}
            />
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="47%" mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('label.advance_edit_user', 'User')}
              onChange={changeUserNaneDetail}
              inputName="uid"
              value={values?.uid}
              autoComplete="new-password"
            />
          </Row>
          <Row mainAlignment="center" crossAlignment="center" padding={{ top: 'small' }}>
            <ds-icon icon="AtOutline" size="large"></ds-icon>
          </Row>
          <Row width="47%" mainAlignment="flex-start">
            <Row mainAlignment="flex-start" crossAlignment="flex-start" width="100%">
              <DropDownInput
                items={items}
                maxWidth="400px"
                width="365px"
                inputLabel={
                  isDomainSelect
                    ? t('label.domain_name', 'Domain Name')
                    : t('domain.type_here_a_domain', 'Type here a domain')
                }
                onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
                  setIsDomainSelect(false);
                  setSearchDomainName(ev.target.value);
                }}
                inputValue={searchDomainName}
                isCustomIcon={false}
              />
            </Row>
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="49%" mainAlignment="flex-start">
            <ManageAliases
              viewType="small"
              aliasType="accounts"
              listAliases={accountAliases}
              setListAliases={setAccountAliases}
              setAliasChange={(aliaes): void =>
                setAccountValues((prev: Record<string, any>) => ({
                  ...prev,
                  mail: map(aliaes, 'label').join(', '),
                }))
              }
            />
          </Row>
          <Row width="49%" mainAlignment="flex-start">
            <LabeledValue
              label={t('label.type', 'Type')}
              value={accountUserType}
              CustomIcon={(): any => (
                <ds-icon
                  icon="DiagonalArrowRightUp"
                  onClick={(): void => setChange(ADMINISTRATION)}
                  style={{ cursor: 'pointer' }}
                  size="large"
                  onChange={(): null => null}
                ></ds-icon>
              )}
            />
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width={!isAdvanced ? '100%' : '49%'} mainAlignment="flex-start">
            <Input
              label={t('label.advance_edit_display_name', 'Display Name')}
              backgroundColor="gray5"
              value={values?.displayName || ''}
              onChange={changeAccDetail}
              inputName="displayName"
              autoComplete="new-password"
            />
          </Row>
          {isAdvanced && (
            <Row width="49%" mainAlignment="flex-start">
              <LabeledValue
                label={t('account_details.otp_devices', 'OTP Devices')}
                backgroundColor="gray5"
                value={otpList?.length || 0}
                defaultValue={0}
              />
            </Row>
          )}
        </Row>
        {isAdvanced && (
          <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
            <Row width="49%" mainAlignment="flex-start">
              <Select
                disabled={!values?.abqMode}
                items={ABQ_STATUS}
                background="gray5"
                label={t('account_details.abq_status', 'ABQ Status')}
                showCheckbox={false}
                onChange={onAccountABQStatusChange}
                selection={
                  ABQ_STATUS.find((item: any) => item.value === values?.abqMode) ||
                  ABQ_STATUS[0]
                }
              />
            </Row>
            <Row width="49%" mainAlignment="flex-start">
              <Select
                disabled={values?.backupEnabled === undefined}
                items={BACKUP_ENABLED_STATUS}
                background="gray5"
                label={t('account_details.included_in_backup', 'Included in Backup')}
                showCheckbox={false}
                onChange={onAccountBackupEnabledStatusChange}
                selection={
                  BACKUP_ENABLED_STATUS.find(
                    (item: any) => item.value === values?.backupEnabled,
                  ) || BACKUP_ENABLED_STATUS[0]
                }
              />
            </Row>
          </Row>
        )}
        <EditAccountQuotaInputs
          cosDetail={cosDetail}
          accountDetail={values}
          initialAccountDetail={savedValues}
          setAccountDetail={setAccountValues}
          onQuotaErrorChange={onQuotaErrorChange}
        />
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="49%" mainAlignment="flex-start">
            <LabeledValue
              label={t('label.server', 'Server')}
              backgroundColor="gray5"
              value={values?.zimbraMailHost}
            />
          </Row>
          <Row width="49%" mainAlignment="flex-start">
            <LabeledValue label="ID" backgroundColor="gray5" value={values?.zimbraId} />
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="49%" mainAlignment="flex-start">
            <LabeledValue
              label={t('label.creation_date', 'Creation Date')}
              backgroundColor="gray6"
              value={
                values?.zimbraCreateTimestamp
                  ? formatZimbraDate(values?.zimbraCreateTimestamp)
                  : t('label.not_available', 'Not Available')
              }
            />
          </Row>
          <Row width="49%" mainAlignment="flex-start">
            <LabeledValue
              label={t('label.last_access', 'Last Access')}
              backgroundColor="gray6"
              value={
                values?.zimbraLastLogonTimestamp
                  ? formatZimbraDate(values?.zimbraLastLogonTimestamp)
                  : t('label.never_logged_in', 'Never logged in')
              }
              defaultValue={t('label.never_logged_in', 'Never logged in')}
            />
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="27%" mainAlignment="flex-start">
            <Switch
              value={values?.zimbraHideInGal === 'TRUE'}
              onClick={(): void => changeSwitchOption('zimbraHideInGal')}
              label={t('account_details.hidden_in_gal', 'Hidden in GAL')}
              iconColor="primary"
            />
            <Tooltip placement="top" label={t('label.global_address_list', 'Global Address List')}>
              <ds-text as="span"
                size="small"
                color="gray0"
                style={{ textDecoration: 'underline', cursor: 'default' }}
              >
                ({t('label.what_is_a_gal', "What's a GAL?")})
              </ds-text>
            </Tooltip>
          </Row>
          {renderSwitchRow(
            t('account_details.this_user_must_change_password', 'This user must change password'),
            values?.zimbraPasswordMustChange === 'TRUE',
            () => changeSwitchOption('zimbraPasswordMustChange'),
          )}
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          {isHidePassword ? (
            <>
              <Row width="49%" mainAlignment="flex-start">
                <Tooltip
                  placement="top"
                  label={t(
                    'label.try_local_password_management_ldap',

                    'Disable the “Try local password management in case of failure” toggle or change your default Auth method to edit these fields',
                  )}
                >
                  <Input
                    isRequired
                    backgroundColor="gray5"
                    label={t('label.password', 'Password')}
                    onChange={changeAccDetail}
                    inputName="password"
                    type="password"
                    autoComplete="new-password"
                    value={values?.password}
                    disabled={isHidePassword}
                  />
                </Tooltip>
              </Row>
              <Row width="49%" mainAlignment="flex-start">
                <Tooltip
                  placement="top"
                  label={t(
                    'label.try_local_password_management_ldap',
                    'Disable the “Try local password management in case of failure” toggle or change your default Auth method to edit these fields',
                  )}
                >
                  <Input
                    isRequired
                    backgroundColor="gray5"
                    label={t('label.repeat_password', 'Repeat Password')}
                    onChange={changeAccDetail}
                    inputName="repeatPassword"
                    type="password"
                    autoComplete="new-password"
                    value={values?.repeatPassword}
                    disabled={isHidePassword}
                  />
                </Tooltip>
              </Row>
            </>
          ) : (
            <>
              <Row width="49%" mainAlignment="flex-start">
                <Input
                  isRequired
                  backgroundColor="gray5"
                  label={t('label.password', 'Password')}
                  onChange={changeAccDetail}
                  inputName="password"
                  type="password"
                  autoComplete="new-password"
                  value={values?.password}
                  disabled={isHidePassword}
                />
              </Row>
              <Row width="49%" mainAlignment="flex-start">
                <Input
                  isRequired
                  backgroundColor="gray5"
                  label={t('label.repeat_password', 'Repeat Password')}
                  onChange={changeAccDetail}
                  inputName="repeatPassword"
                  type="password"
                  autoComplete="new-password"
                  value={values?.repeatPassword}
                  disabled={isHidePassword}
                />
              </Row>
            </>
          )}
        </Row>
      </Row>
      {allowedDeletePassword && (
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          {isHidePassword ? (
            <Tooltip
              placement="top"
              label={t(
                'label.try_local_password_management_ldap',
                'Disable the “Try local password management in case of failure” toggle or change your default Auth method to edit these fields',
              )}
            >
              <Row width="100%" mainAlignment="space-between">
                <Button
                  type="outlined"
                  label={t(
                    'account_details.delete_user_password',
                    'DELETE USER PASSWORD FROM THE LDAP',
                  )}
                  color="error"
                  width="fill"
                  onClick={(): void => setShowDeletePasswordModal(true)}
                  disabled={isHidePassword}
                />
              </Row>
            </Tooltip>
          ) : (
            <Row width="100%" mainAlignment="space-between">
              <Button
                type="outlined"
                label={t(
                  'account_details.delete_user_password',
                  'DELETE USER PASSWORD FROM THE LDAP',
                )}
                color="error"
                width="fill"
                onClick={(): void => setShowDeletePasswordModal(true)}
                disabled={isHidePassword}
              />
            </Row>
          )}
        </Row>
      )}

      {extLdapAuth && (
        <>
          <Row width="100%">
            <ds-divider></ds-divider>
          </Row>
          <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
            <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
              <ds-text as="h2" size="small" color="gray0" weight="bold">
                {t('domain.accounts.editAccount.externalldap', 'External LDAP')}
              </ds-text>
            </Row>
            <Row
              padding={{ top: 'large', left: 'large' }}
              width="100%"
              mainAlignment="space-between"
            >
              <Row width="100%" mainAlignment="space-between">
                <Input
                  data-testid="zimbraAuthLdapExternalDn"
                  label={t(
                    'domain.accounts.editAccount.externalldapReferenceForAuthentication',
                    'External LDAP Reference for Authentication',
                  )}
                  backgroundColor="gray5"
                  onChange={changeAccDetail}
                  inputName="zimbraAuthLdapExternalDn"
                  value={values?.zimbraAuthLdapExternalDn || ''}
                />
              </Row>
            </Row>
          </Row>
        </>
      )}
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
        <Row padding={{ top: 'large' }}>
          <ds-text as="h2" size="small" color="gray0" weight="bold">
            {t('label.settings', 'Settings')}
          </ds-text>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="49%" mainAlignment="flex-start">
            {values?.zimbraId ? (
              <Select
                items={ACCOUNT_STATUS}
                background="gray5"
                label={t('label.account_status', 'Account Status')}
                showCheckbox={false}
                onChange={onAccountStatusChange}
                selection={
                  ACCOUNT_STATUS.find(
                    (item: { value: string; label: string }) =>
                      item.value === values?.zimbraAccountStatus,
                  ) ?? ACCOUNT_STATUS[0]
                }
              />
            ) : (
              <></>
            )}
          </Row>
          <Row width="49%" mainAlignment="flex-start">
            {values?.zimbraId && localeZone?.length ? (
              <InheritedSelect
                label={t('label.language', 'Language')}
                items={localeZone}
                subValue={values.zimbraPrefLocale}
                inheritedValue={cosDetail.zimbraPrefLocale}
                fromSubValue={accSpecificDetail?.zimbraPrefLocale}
                background="gray5"
                selectName="zimbraPrefLocale"
                onChange={onPrefLocaleChange}
                onChangeReset={(): void => setEmptyValue('zimbraPrefLocale')}
              />
            ) : (
              <></>
            )}
          </Row>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="15.5%" mainAlignment="flex-start">
            <Switch
              defaultChecked={defaultCOS}
              onClick={onCOSSwitchChanges}
              label={t('account_details.default_COS', 'Default COS')}
              iconColor="primary"
              value={defaultCOS}
            />
          </Row>
          <Row width="84.5%" mainAlignment="flex-start">
            {cosItems?.length ? (
              <Select
                disabled={defaultCOS}
                items={cosItems}
                background="gray5"
                label={t('label.default_class_of_service', 'Default Class of Service')}
                showCheckbox={false}
                selection={selection}
                onChange={onCOSIdChange}
              />
            ) : (
              <></>
            )}
          </Row>
        </Row>
        <Row
          padding={{ top: 'large', left: 'large' }}
          width="100%"
          mainAlignment="space-between"
        ></Row>
      </Row>
      <Row width="100%" padding={{ top: 'large' }}>
        <ds-divider></ds-divider>
      </Row>
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
        <ds-text as="h2" size="small" color="gray0" weight="bold">
          {t('label.distribution_list', 'Distribution List')}
        </ds-text>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="100%" mainAlignment="space-between">
          <ChipInput
            placeholder={t(
              'account_details.this_account_is_a_direct_member_of',
              'This account is a direct member of',
            )}
            background="gray4"
            disabled
            value={directMemberList}
            ChipComponent={CustomChip}
            maxChips={null}
          />
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="100%" mainAlignment="space-between">
          <ChipInput
            placeholder={t(
              'account_details.this_account_is_a_in_direct_member_of',
              'This account is an indirect member of',
            )}
            background="gray4"
            disabled
            value={inDirectMemberList}
            ChipComponent={CustomChip}
            maxChips={null}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
        <Row padding={{ top: 'large' }}>
          <ds-text as="h2" size="small" color="gray0" weight="bold">
            {t('label.description', 'Description')}
          </ds-text>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%">
          <Input
            backgroundColor="gray5"
            label={t('label.description', 'Description')}
            value={values?.description || ''}
            onChange={changeAccDetail}
            inputName="description"
          />
        </Row>
        <Row padding={{ top: 'large' }}>
          <ds-text as="h2" size="small" color="gray0" weight="bold">
            {t('label.notes', 'Notes')}
          </ds-text>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%">
          <CustomTextArea
            label={t('label.notes', 'Notes')}
            value={values?.zimbraNotes || ''}
            backgroundColor="gray5"
            inputName="zimbraNotes"
            onChange={changeAccDetail}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      <Row
        mainAlignment="flex-start"
        padding={{ top: 'large', left: 'small', bottom: 'extralarge' }}
        width="100%"
      >
        <Row padding={{ top: 'extralarge' }}>
          <ds-text as="h2" size="small" weight="bold">
            {t('label.active_sessions', 'Active Sessions')}
          </ds-text>
        </Row>
        <Row
          padding={{ top: 'extralarge' }}
          width="97%"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
        >
          <Container width="calc(100% - 13rem)">
            <Input
              label={t('label.i_m_looking_for_the_session', 'I`m looking for the session ...')}
              backgroundColor="gray5"
              width="100%"
              onChange={onSessionFilterInputChange}
            ></Input>
          </Container>
          <Padding horizontal="small" />
          <Container width="12rem" mainAlignment="flex-end" crossAlignment="flex-end">
            <Button
              label={t('label.end_session', 'End Session')}
              color="error"
              type="outlined"
              icon="StopCircleOutline"
              iconPlacement="right"
              size="extralarge"
              disabled={selectedSession.length === 0 || isRequestInProgress}
              onClick={onEndSession}
              loading={isRequestInProgress}
            />
          </Container>
        </Row>
        <Row
          padding={{ top: 'extralarge' }}
          width="97%"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
        >
          <Table
            rows={sessionListRows}
            headers={sessionTableHeader}
            showCheckbox={false}
            selectedRows={selectedSession}
            multiSelect={false}
            HeaderFactory={CustomHeaderFactory}
            RowFactory={HoverableRowFactory}
          />
        </Row>

        <Row
          padding={{ top: 'extralarge' }}
          width="97%"
          mainAlignment="flex-end"
          crossAlignment="flex-end"
        >
          <Paging totalItem={1} setOffset={(): null => null} />
        </Row>
      </Row>

      <Modal
        size="small"
        title={t('account_details.delete_password', 'Delete Password', {
          name: values?.givenName,
        })}
        open={showDeletePasswordModal}
        customFooter={
          <Container orientation="horizontal" mainAlignment="flex-end">
            <Row style={{ gap: '0.5rem' }}>
              <Button
                label={t('label.no_go_back', 'No, go back')}
                color="secondary"
                onClick={(): void => setShowDeletePasswordModal(false)}
              />
              <Button
                label={t('label.yes_delete_it', 'Yes, delete it')}
                color="error"
                onClick={(): void => deleteUserPassword()}
              />
            </Row>
          </Container>
        }
        showCloseIcon
        onClick={(): void => setShowDeletePasswordModal(false)}
      >
        <ds-text as="p"
          size={'extralarge'}
          overflow="break-word"
          style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 1rem' }}
        >
          <Trans
            i18nKey="account_details.delete_password_of_user_ldap"
            defaults="You are deleting the password of <bold>{{name}}</bold> from the LDAP. Are you sure you want to delete it?"
            components={{ bold: <strong /> }}
            values={{
              name: values?.givenName,
            }}
          />
        </ds-text>
      </Modal>
    </Container>
  );
};
