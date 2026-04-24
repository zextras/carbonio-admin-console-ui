/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  CustomHeaderFactory,
  CustomTextArea,
  HoverableRowFactory,
  Input,
  LabeledValue,
  ListRow,
  Modal,
  Padding,
  Paging,
  Row,
  Table,
  Tooltip,
  TrackNumberPerPage,
  type TRow,
  useSnackbar,
} from '@zextras/ui-components';
import { replaceHistory, useCurrentUserRights } from '@zextras/ui-shared';
import { debounce, find } from 'lodash-es';
import { ChangeEvent, FC, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Attribute } from '../../../types/attribute';
import logo from '../../assets/gardian.svg';
import { COS, DEFAULT, RECORD_DISPLAY_LIMIT, ZIMBRA_ADMIN_URN } from '../../constants';
import { deleteCOS } from '../../services/delete-cos-service';
import { flushCache } from '../../services/flush-cache-service';
import { modifyCos, ModifyCosBody } from '../../services/modify-cos-service';
import { renameCos } from '../../services/rename-cos-service';
import { searchDirectory } from '../../services/search-directory-service';
import { useCosStore } from '../../store/cos/store';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';
import { PageLayout } from '../page-layout';
import { getDateFromStr, getFormatedDate } from '../utility/utils';

const CosGeneralInformation: FC = () => {
  const [t] = useTranslation();
  const cosInformation = useCosStore((state) => state.cos?.a);
  const cosDetail = useCosStore((state) => state.cos);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const createSnackbar = useSnackbar();
  const [cosData, setCosData] = useState<Record<string, string>>({});
  const [cosName, setCosName] = useState<string>('');
  const [zimbraNotes, setZimbraNotes] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const setCos = useCosStore((state) => state.setCos);
  const [openDeleteCOSConfirmDialog, setOpenDeleteCOSConfirmDialog] = useState<boolean>(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const totalAccount = useCosStore((state) => state.totalAccount);
  const totalDomain = useCosStore((state) => state.totalDomain);
  const { data: rights = [] } = useCurrentUserRights();
  const [accountList, setAccountList] = useState<Array<TRow>>([]);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [accountLimit, setAccountLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [searchAccountString, setSearchAccountString] = useState<string>('');
  const [searchAccountQuery, setSearchAccountQuery] = useState<string>('');
  const [totalAccounts, setTotalAccounts] = useState<number>(0);
  const tableRef = useRef(null);
  const [isAccountRequestInProgress, setIsAccountRequestInProgress] = useState<boolean>(false);
  const [domainList, setDomainList] = useState<Array<TRow>>([]);
  const [searchDomainString, setSearchDomainString] = useState<string>('');
  const [searchDomainQuery, setSearchDomainQuery] = useState<string>('');
  const [totalDomains, setTotalDomains] = useState<number>(0);
  const [isDomainRequestInProgress, setIsDomainRequestInProgress] = useState<boolean>(false);
  const [domainOffset, setDomainOffset] = useState<number>(0);

  const accountHeaders = useMemo(
    () => [
      {
        id: 'email',
        label: t('label.email', 'Email'),
        width: '25%',
        bold: true,
      },
      {
        id: 'name',
        label: t('label.person_name', 'Name'),
        width: '15%',
        bold: true,
      },
      {
        id: 'aliases',
        label: t('label.Aliases', 'Aliases'),
        width: '10%',
        bold: true,
      },
      {
        id: 'type',
        label: t('label.type', 'Type'),
        width: '10%',
        bold: true,
      },
      {
        id: 'status',
        label: t('label.status', 'Status'),
        width: '10%',
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

  const STATUS_COLOR: Record<string, { color: string; label: string }> = useMemo(
    () => ({
      active: {
        color: '#8BC34A',
        label: t('label.active', 'Active'),
      },
      maintenance: {
        color: '#2196D3',
        label: t('label.in_maintenance', 'In maintenance'),
      },
      locked: {
        color: '#D74942',
        label: t('label.locked', 'Locked'),
      },
      closed: {
        color: '#828282',
        label: t('label.closed', 'Closed'),
      },
      pending: {
        color: '#828282',
        label: t('label.pending', 'Pending'),
      },
      lockout: {
        color: '#D74942',
        label: t('label.lockout', 'Lockout'),
      },
    }),
    [t],
  );

  const accountUserType = useCallback((item: Record<string, string>): string => {
    if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
    if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
    if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
    if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
    return 'Normal';
  }, []);

  const domainHeaders = useMemo(
    () => [
      {
        id: 'domains',
        label: t('label.domains', 'Domains'),
        width: '35%',
        bold: true,
      },
      {
        id: 'maximum_accounts',
        label: t('label.maximum_handled_accounts', 'Maximum Handled Accounts'),
        width: '45%',
        bold: true,
      },
      {
        id: 'description',
        label: '',
        width: '20%',
        bold: true,
      },
    ],
    [t],
  );

  const readonlyCOS = useMemo(() => {
    const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
    return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
  }, [rights]);

  useEffect(() => {
    if (!!cosInformation && cosInformation.length > 0) {
      const obj: Record<string, string> = {};
      cosInformation.forEach((item) => {
        obj[item?.n] = item._content;
      });
      setCosName(obj.cn);
      if (obj.zimbraNotes) {
        setZimbraNotes(obj.zimbraNotes);
      } else {
        obj.zimbraNotes = '';
        setZimbraNotes('');
      }
      if (obj.description) {
        setDescription(obj.description);
      } else {
        obj.description = '';
        setDescription('');
      }
      setCosData(obj);
      setIsDirty(false);
    }
  }, [cosInformation]);

  useEffect(() => {
    if (cosData.cn !== undefined && cosData.cn !== cosName) {
      setIsDirty(true);
    }
  }, [cosData?.cn, cosName]);

  useEffect(() => {
    if (cosData.zimbraNotes !== undefined && cosData.zimbraNotes !== zimbraNotes) {
      setIsDirty(true);
    }
  }, [cosData.zimbraNotes, zimbraNotes]);

  useEffect(() => {
    if (cosData.description !== undefined && cosData.description !== description) {
      setIsDirty(true);
    }
  }, [cosData.description, description]);

  const modifyCosInfo = (): void => {
    const attributes: Attribute[] = [
      {
        n: 'zimbraNotes',
        _content: zimbraNotes,
      },
      {
        n: 'description',
        _content: description,
      },
      {
        n: 'cn',
        _content: cosName,
        c: true,
      },
    ];
    const body: ModifyCosBody = {
      _jsns: ZIMBRA_ADMIN_URN,
      a: attributes,
      id: {
        _content: cosData.zimbraId,
      },
    };
    modifyCos(body)
      .then((data) => {
        flushCache('cos', 'id', body.id._content);
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.change_save_success_msg', 'The change has been saved successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        const cos = data?.cos[0];
        if (cos) {
          setCos(cos);
        }
        setIsDirty(false);
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

  const onSave = (): void => {
    if (cosData.cn !== cosName) {
      const renameBody = {
        _jsns: ZIMBRA_ADMIN_URN,
        id: {
          _content: cosData.zimbraId,
        },
        newName: {
          _content: cosName,
        },
      };

      renameCos(renameBody)
        .then(() => {
          modifyCosInfo();
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
    } else {
      modifyCosInfo();
    }
  };

  const onCancel = (): void => {
    setCosName(cosData.cn);
    setZimbraNotes(cosData.zimbraNotes);
    setDescription(cosData.description);
    setIsDirty(false);
  };

  const cosCreationDate = useMemo(
    () =>
      !!cosData.zimbraCreateTimestamp && cosData.zimbraCreateTimestamp !== null
        ? getFormatedDate(getDateFromStr(cosData.zimbraCreateTimestamp)) ?? ''
        : '',
    [cosData.zimbraCreateTimestamp],
  );

  const canDeleteCOS = useMemo(() => !!(cosName === '' || cosName === DEFAULT), [cosName]);

  const onDeleteCOSConfirmation = (): void => {
    setOpenDeleteCOSConfirmDialog(true);
  };

  const onDeleteCOS = (): void => {
    setIsRequestInProgress(true);
    deleteCOS(cosData.zimbraId)
      .then((data) => {
        setIsRequestInProgress(false);
        if (data) {
          createSnackbar({
            key: 'info',
            severity: 'info',
            label: t('label.delete_cos_succeess', {
              cosname: cosName,
              defaultValue: 'The {{cosname}} has been deleted successfully',
            }),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });

          setOpenDeleteCOSConfirmDialog(false);
          replaceHistory(`/`);
        }
      })
      .catch((error) => {
        setIsRequestInProgress(false);
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

  const getAccountList = useCallback((): void => {
    if (!searchAccountQuery) {
      return;
    }
    setIsAccountRequestInProgress(true);
    const type = 'accounts';
    const attrs =
      'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
    searchDirectory(attrs, type, '', searchAccountQuery, offset, accountLimit)
      .then((data) => {
        const accountListResponse = data?.account || [];
        if (accountListResponse && Array.isArray(accountListResponse)) {
          const accountListArr: Array<TRow> = [];
          setTotalAccounts(data.searchTotal || 0);
          accountListResponse.forEach((item) => {
            const acc = item as Record<string, unknown>;
            item?.a?.forEach((ele) => {
              if (ele?.n === 'mail') {
                const existing = acc[ele?.n];
                if (Array.isArray(existing)) {
                  existing.push(ele._content);
                } else {
                  acc[ele?.n] = [ele._content];
                }
              } else {
                acc[ele?.n] = ele._content;
              }
            });
            accountListArr.push({
              id: item?.id,
              columns: [
                <ds-text as="span" size="small" key={item?.id} color="gray0" weight="regular">
                  {item?.name || ' '}
                </ds-text>,
                <ds-text as="span" size="small" key={item?.id} color="gray0" weight="light">
                  {(acc?.displayName as string) || <>&nbsp;</>}
                </ds-text>,
                <>
                  {Array.isArray(acc?.mail) && (acc.mail as Array<string>).length - 1 > 0 ? (
                    <Tooltip
                      key={item?.id}
                      placement="bottom"
                      label={(acc.mail as Array<string>).slice(1).join(', ')}
                      maxWidth="auto"
                    >
                      <ds-text as="span" size="small" weight="light" key={item?.id} color="#828282">
                        {(acc.mail as Array<string>).length - 1}
                      </ds-text>
                    </Tooltip>
                  ) : (
                    <ds-text as="span" size="small" key={item?.id} color="#828282" weight="light">
                      0
                    </ds-text>
                  )}
                </>,
                <ds-text as="span" size="small" key={item?.id} color="gray0" weight="light">
                  {accountUserType(acc as Record<string, string>)}
                </ds-text>,
                <ds-text
                  as="span"
                  size="small"
                  weight="light"
                  key={item?.id}
                  color={STATUS_COLOR[acc?.zimbraAccountStatus as string]?.color}
                >
                  {STATUS_COLOR[acc?.zimbraAccountStatus as string]?.label}
                </ds-text>,
                <ds-text as="span" size="small" weight="light" key={item?.id} color="gray0">
                  {(acc?.description as string) || <>&nbsp;</>}
                </ds-text>,
              ],
              clickable: true,
            });
          });
          setAccountList(accountListArr);
        }
        setIsAccountRequestInProgress(false);
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
        setIsAccountRequestInProgress(false);
      });
  }, [searchAccountQuery, offset, accountLimit, accountUserType, STATUS_COLOR, t, createSnackbar]);

  useEffect(() => {
    if (cosDetail?.id) {
      getAccountList();
    }
  }, [cosDetail?.id, getAccountList]);

  const generateAccountSearchFilterQuery = useCallback(
    (searchStr: string, cosId: string | undefined): string => {
      let filterQuery = `(&(zimbraCOSId=${cosId})(!(zimbraIsSystemAccount=TRUE)))`;
      if (searchStr) {
        filterQuery += `(|(mail=*${searchStr}*)(cn=*${searchStr}*)(sn=*${searchStr}*)(gn=*${searchStr}*)(displayName=*${searchStr}*)(zimbraMailDeliveryAddress=*${searchStr}*))`;
      }
      if (searchStr) {
        return `(&${filterQuery})`;
      }
      return filterQuery;
    },
    [],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchAccountList = useCallback(
    debounce((searchStr: string, cosId: string | undefined) => {
      setSearchAccountQuery(generateAccountSearchFilterQuery(searchStr, cosId));
    }, 700),
    [debounce],
  );
  useEffect(() => {
    searchAccountList(searchAccountString, cosDetail.id);
  }, [cosDetail?.id, searchAccountList, searchAccountString]);

  const getDomainList = useCallback((): void => {
    if (!searchDomainQuery) {
      return;
    }
    setIsDomainRequestInProgress(true);
    const type = 'domains';
    const attrs =
      'description,zimbraDomainName,zimbraDomainStatus,zimbraId,zimbraDomainType,zimbraDomainCOSMaxAccounts,zimbraDomainDefaultCOSId';
    searchDirectory(attrs, type, '', searchDomainQuery, domainOffset, limit)
      .then((data) => {
        const domainListResponse = data?.domain || [];
        if (domainListResponse && Array.isArray(domainListResponse)) {
          const domainListArr: Array<TRow> = [];
          setTotalDomains(data.searchTotal || 0);
          domainListResponse.forEach((item) => {
            const domainItem = item as Record<string, unknown>;
            item?.a?.forEach((ele) => {
              if (ele?.n === 'zimbraDomainCOSMaxAccounts') {
                const existing = domainItem[ele?.n];
                if (Array.isArray(existing)) {
                  existing.push(ele._content);
                } else {
                  domainItem[ele?.n] = [ele._content];
                }
              } else {
                domainItem[ele?.n] = ele._content;
              }
            });
            const cosMaxAccounts = domainItem?.zimbraDomainCOSMaxAccounts;
            const maxAccountValue = Array.isArray(cosMaxAccounts)
              ? (cosMaxAccounts as Array<string>)
                .filter((acc) => acc?.split(':')[0] === cosDetail?.id)[0]
                ?.split(':')[1]
              : undefined;
            domainListArr.push({
              id: item?.id,
              columns: [
                <ds-text as="span" size="small" key={item?.id} color="gray0" weight="regular">
                  {item?.name || ' '}
                </ds-text>,
                <ds-text as="span" size="small" key={item?.id} color="gray0" weight="light">
                  {maxAccountValue || ' '}
                </ds-text>,
                <Container key={item?.id}>
                  {cosDetail?.id === domainItem?.zimbraDomainDefaultCOSId && (
                    <Row>
                      <Padding right="small">
                        <ds-text as="span" size="small" weight="light" color="gray0">
                          {t('label.default_cos', 'Default COS')}
                        </ds-text>
                      </Padding>
                      <ds-icon icon="Star" color="primary"></ds-icon>
                    </Row>
                  )}
                </Container>,
              ],
              clickable: true,
            });
          });
          setDomainList(domainListArr);
        }
        setIsDomainRequestInProgress(false);
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
        setIsDomainRequestInProgress(false);
      });
  }, [searchDomainQuery, domainOffset, limit, cosDetail?.id, t, createSnackbar]);

  useEffect(() => {
    if (cosDetail?.id) {
      getDomainList();
    }
  }, [cosDetail?.id, getDomainList]);

  const generateDomainSearchFilterQuery = useCallback(
    (searchStr: string, cosId: string | undefined): string => {
      let filterQuery = `(|(zimbraDomainCOSMaxAccounts=${cosId}*)(zimbraDomainDefaultCOSId=${cosId}))`;
      if (searchStr) {
        filterQuery += `(|(zimbraDomainName=*${searchStr}*))`;
      }
      if (searchStr) {
        return `(&${filterQuery})`;
      }
      return filterQuery;
    },
    [],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchDomainList = useCallback(
    debounce((searchStr: string, cosId: string | undefined) => {
      setSearchDomainQuery(generateDomainSearchFilterQuery(searchStr, cosId));
    }, 700),
    [debounce],
  );
  useEffect(() => {
    searchDomainList(searchDomainString, cosDetail.id);
  }, [cosDetail?.id, searchDomainList, searchDomainString]);

  return (
    <PageLayout
      title={t('cos.general_information', 'General Information')}
      onSave={onSave}
      onCancel={onCancel}
      unSavedChanges={isDirty}
    >
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflow: 'auto' }}
        width="100%"
      // height="calc(100vh - 230px)"
      >
        <Row mainAlignment="flex-start" width="100%">
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <Input
                  isRequired
                  label={t('label.name', 'Name')}
                  backgroundColor={canDeleteCOS ? 'gray6' : 'gray5'}
                  value={cosName}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                    setCosName(e.target.value);
                  }}
                  disabled={canDeleteCOS || readonlyCOS}
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <Input
                  label={t('label.id_lbl', 'ID')}
                  backgroundColor="gray6"
                  value={cosData.zimbraId}
                  disabled
                  onChange={(): void => {
                    //
                  }}
                />
              </Container>
              <Container padding={{ all: 'small' }}>
                <Input
                  label={t('label.creation_date', 'Creation Date')}
                  value={cosCreationDate}
                  backgroundColor="gray6"
                  disabled
                  onChange={(): void => {
                    //
                  }}
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <LabeledValue
                  label={t('label.accounts_that_use_this_cos', 'Accounts that use this CoS')}
                  backgroundColor="gray6"
                  value={totalAccount}
                />
              </Container>
              <Container padding={{ all: 'small' }}>
                <LabeledValue
                  label={t(
                    'label.domains_that_use_this_cos_as_default',
                    'Domains that use this CoS as default',
                  )}
                  value={totalDomain}
                  backgroundColor="gray6"
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <Input
                  label={t('label.description', 'Description')}
                  backgroundColor="gray5"
                  value={description}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                    setDescription(e.target.value);
                  }}
                  disabled={readonlyCOS}
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <CustomTextArea
                  label={t('label.notes', 'Notes')}
                  backgroundColor="gray5"
                  value={zimbraNotes}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                    setZimbraNotes(e.target.value);
                  }}
                  disabled={readonlyCOS}
                />
              </Container>
            </ListRow>
          </Container>
        </Row>
        <Row width="100%" padding={{ vertical: 'large' }}>
          <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
            <ds-text as="strong" size="medium" weight="bold" color="gray0">
              {t('cos.domains_that_use_this_cos', 'Domains that use this COS')}
            </ds-text>
          </Row>
        </Row>
        <Row
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          width="fill"
        >
          <Container padding={{ all: 'small' }}>
            <Input
              label={t('label.search_for_a_domain', `Search for a domain`)}
              disabled={domainList.length === 0 && searchDomainString.length === 0}
              value={searchDomainString}
              backgroundColor="gray5"
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                setSearchDomainString(e.target.value);
              }}
              CustomIcon={(): ReactElement => (
                <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
              )}
            />
          </Container>
        </Row>
        <Row
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          width="fill"
          style={{
            height: 'calc(100vh - 21.25rem)',
            position: 'relative',
          }}
          ref={tableRef}
        >
          <Container padding={{ all: 'small' }}>
            <Table
              rows={!isDomainRequestInProgress ? domainList : []}
              headers={domainHeaders}
              showCheckbox={false}
              multiSelect={false}
              style={{
                overflow: 'auto',
                height: '100%',
              }}
              RowFactory={HoverableRowFactory}
              HeaderFactory={CustomHeaderFactory}
            />
            {isDomainRequestInProgress && (
              <Container
                crossAlignment="center"
                mainAlignment="center"
                height="auto"
                padding={{ top: 'medium' }}
              >
                <ds-spinner></ds-spinner>
              </Container>
            )}
            {domainList.length === 0 && !isDomainRequestInProgress && (
              <Container
                orientation="column"
                crossAlignment="center"
                mainAlignment="center"
                style={{ marginTop: '1rem' }}
              >
                <Row>
                  <img src={logo} alt="logo" />
                </Row>
                <Row
                  padding={{ top: 'extralarge' }}
                  orientation="vertical"
                  crossAlignment="center"
                  style={{ textAlign: 'center' }}
                >
                  <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
                    {t('label.this_list_is_empty', 'This list is empty.')}
                  </ds-text>
                </Row>
              </Container>
            )}
            {domainList.length !== 0 && (
              <Container
                orientation="horizontal"
                mainAlignment="space-between"
                width="100%"
                style={{ position: 'absolute', bottom: '-4rem' }}
                height="auto"
                padding={{ all: 'large' }}
              >
                <Container crossAlignment="flex-start" padding={{ all: 'small' }}>
                  <Paging totalItem={totalDomains} setOffset={setDomainOffset} pageSize={limit} />
                </Container>
                <Container
                  crossAlignment="flex-end"
                  orientation="horizontal"
                  mainAlignment="flex-end"
                  padding={{ all: 'small' }}
                >
                  <TrackNumberPerPage setPageSize={setLimit} />
                </Container>
              </Container>
            )}
          </Container>
        </Row>
        <Row
          width="100%"
          padding={{ vertical: 'large' }}
          style={{ marginTop: domainList.length > 0 ? '3rem' : '0rem' }}
        >
          <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
            <ds-text as="strong" size="medium" weight="bold" color="gray0">
              {t('cos.accounts_that_use_this_cos', 'Accounts that use this COS')}
            </ds-text>
          </Row>
        </Row>
        <Row
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          width="fill"
        >
          <Container padding={{ all: 'small' }}>
            <Input
              label={t('label.search_for_an_account', `Search for an account`)}
              disabled={accountList.length === 0 && searchAccountString.length === 0}
              value={searchAccountString}
              backgroundColor="gray5"
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                setSearchAccountString(e.target.value);
              }}
              CustomIcon={(): ReactElement => (
                <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
              )}
            />
          </Container>
        </Row>
        <Row
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          width="fill"
          style={{
            height: 'calc(100vh - 21.25rem)',
            position: 'relative',
          }}
          ref={tableRef}
          padding={{ bottom: 'large' }}
        >
          <Container padding={{ all: 'small' }}>
            <Table
              rows={!isAccountRequestInProgress ? accountList : []}
              headers={accountHeaders}
              showCheckbox={false}
              multiSelect={false}
              style={{
                overflow: 'auto',
                height: '100%',
              }}
              RowFactory={HoverableRowFactory}
              HeaderFactory={CustomHeaderFactory}
            />
            {isAccountRequestInProgress && (
              <Container
                crossAlignment="center"
                mainAlignment="center"
                height="auto"
                padding={{ top: 'medium' }}
              >
                <ds-spinner></ds-spinner>
              </Container>
            )}
            {accountList.length === 0 && !isAccountRequestInProgress && (
              <Container
                orientation="column"
                crossAlignment="center"
                mainAlignment="center"
                style={{ marginTop: '1rem' }}
              >
                <Row>
                  <img src={logo} alt="logo" />
                </Row>
                <Row
                  padding={{ top: 'extralarge' }}
                  orientation="vertical"
                  crossAlignment="center"
                  style={{ textAlign: 'center' }}
                >
                  <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
                    {t('label.this_list_is_empty', 'This list is empty.')}
                  </ds-text>
                </Row>
              </Container>
            )}
            {accountList.length !== 0 && (
              <Container
                orientation="horizontal"
                mainAlignment="space-between"
                width="100%"
                style={{ position: 'absolute', bottom: '-4rem' }}
                height="auto"
                padding={{ all: 'large' }}
              >
                <Container crossAlignment="flex-start" padding={{ all: 'small' }}>
                  <Paging totalItem={totalAccounts} setOffset={setOffset} pageSize={accountLimit} />
                </Container>
                <Container
                  crossAlignment="flex-end"
                  orientation="horizontal"
                  mainAlignment="flex-end"
                  padding={{ all: 'small' }}
                >
                  <TrackNumberPerPage setPageSize={setAccountLimit} />
                </Container>
              </Container>
            )}
          </Container>
        </Row>
      </Container>
      <Row
        width="100%"
        padding={{ top: 'small', right: 'large', bottom: 'large', left: 'large' }}
        style={{ display: 'block' }}
      >
        <Button
          type="outlined"
          label="DELETE"
          icon="Trash2Outline"
          color="error"
          size="large"
          width="fill"
          style={{ width: '100%' }}
          disabled={canDeleteCOS || readonlyCOS}
          onClick={onDeleteCOSConfirmation}
        />
      </Row>
      <Modal
        title={
          <Trans
            i18nKey="label.deleting_cos_msg"
            defaults="Deleting <bold>{{cosname}}</bold>"
            components={{ bold: <strong /> }}
            values={{
              cosname: cosName,
            }}
          />
        }
        open={openDeleteCOSConfirmDialog}
        showCloseIcon
        onClose={(): void => {
          setOpenDeleteCOSConfirmDialog(false);
        }}
        size="medium"
        customFooter={
          <Container orientation="horizontal" mainAlignment="space-between">
            <Container orientation="horizontal" mainAlignment="flex-end" width="fit">
              <Padding all="small">
                <Button
                  label={t('label.no_go_back', 'No, Go Back')}
                  color="secondary"
                  size="medium"
                  onClick={(): void => {
                    setOpenDeleteCOSConfirmDialog(false);
                  }}
                />
              </Padding>
              <Button
                label={t('label.yes_delete', 'Yes, Delete')}
                color="error"
                onClick={onDeleteCOS}
                disabled={isRequestInProgress}
              />
            </Container>
          </Container>
        }
      >
        <Container>
          <Padding bottom="small" top="extralarge">
            <ds-text as="p" overflow="break-word" weight="regular">
              {t('label.you_are_deleting', {
                cosname: cosName,
                defaultValue: 'You are deleting {{cosname}}',
              })}
            </ds-text>
          </Padding>
          <Padding bottom="small">
            <ds-text as="p" overflow="break-word" weight="regular">
              {t(
                'label.are_you_sure_deleting_cos',
                'Are you sure you want to delete this Class of Service?',
              )}
            </ds-text>
          </Padding>
          <Padding bottom="extralarge">
            <ds-text as="p" overflow="break-word" weight="regular">
              {t(
                'label.delete_cos_instruction_msg',
                'If you click YES, DELETE the DefaultCOS will be replace the deleted COS.',
              )}
            </ds-text>
          </Padding>
        </Container>
      </Modal>
    </PageLayout>
  );
};

export default CosGeneralInformation;
