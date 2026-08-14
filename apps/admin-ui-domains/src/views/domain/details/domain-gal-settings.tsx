/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Button, Container, CustomHeaderFactory, Dropdown, DropdownItem, HoverableRowFactory, Input, LabeledValue, ListRow, Padding, RouteLeavingGuard, Row, Select, Switch, Table, Tooltip } from '@zextras/ui-components';
import { domainByIdKey, flushCache, getDomainInformation, useMailstoreServers, useUserSettings } from '@zextras/ui-shared';
import React, { ChangeEvent, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { AccountDataType, Attribute, Server } from '../../../../types';
import {
  EXTERNAL_SERVER_EXAMPLE,
  FALSE,
  INTERNAL_GAL,
  LDAP_BIND_DN_LABLE,
  LDAP_FILTER_LABEL,
  LDAP_SEARCH_BASE_LABEL,
  TRUE,
  ZIMBRA,
  ZIMBRA_ADMIN_URN,
} from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { createGalSyncAccount } from '../../../services/create-gal-sync-service';
import { destroyAccount } from '../../../services/destroy-account-service';
import { getAccount } from '../../../services/get-account-service';
import { getDatasource } from '../../../services/get-datasource-service';
import { modifyAccountRequest } from '../../../services/modify-account';
import { modifyDataSource } from '../../../services/modify-datasource-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { reSyncGalAccount } from '../../../services/re-sync-gal-account-service';
import { GalServerTableheaders, MeasureUnitItems } from '../../utility/utils';
import { DomainFormActions } from './components/domain-form-actions';
import CreateGalsyncAccountModel from './create-galsync-account-model';
import DistroyGalsyncAccountModel from './distroy-galsync-account-model';
import { useDomainMutation } from './hooks/use-domain-mutation';
import { GAL_SETTINGS_DEFAULTS,GalSettingsFormValues, galSettingsSchema } from './schemas/domain-gal-settings-schema';
import {
  formatPollingInterval,
  parseGalFormFromAttributes,
  parsePollingInterval,
  PollingInterval,
  PollingUnit
} from './schemas/gal-settings-types';

// === Helper types for GAL account fetching ===
interface GalAccountInfo {
  accountData: Attribute[];
  name: string;
  id: string;
}

// === Helper functions to reduce nesting ===
async function fetchGalAccountInfo(accountId: string): Promise<GalAccountInfo | undefined> {
  try {
    const data = await getAccount(accountId);
    const account = data?.account?.[0];
    if (!account) return undefined;
    const mailHostAttr = account.a?.filter((a: Attribute) => a.n === 'zimbraMailHost') ?? [];
    return { accountData: mailHostAttr, name: account.name, id: account.id };
  } catch {
    return undefined;
  }
}

function extractPollingInterval(account: { a?: Attribute[] }): PollingInterval | null {
  const attr = account.a?.find((a: Attribute) => a.n === 'zimbraDataSourceGalPollingInterval');
  return attr ? parsePollingInterval(attr._content) : null;
}

type InputIconProps = { hasFocus: boolean };

const createInfoIcon = (tooltipLabel: string) =>
  function InfoIcon({ hasFocus }: InputIconProps): React.ReactElement {
    return (
      <Tooltip placement="top" overflow="break-word" maxWidth="40rem" label={tooltipLabel}>
        <ds-text as="span">
          <ds-icon icon="InfoOutline" size="large" color={hasFocus ? 'primary' : 'text'}></ds-icon>
        </ds-text>
      </Tooltip>
    );
  };

interface TableRowData {
  id: string;
  columns: Array<React.ReactElement>;
  clickable: boolean;
}

const ServerListTable: FC<{
  volumes: Array<AccountDataType>;
  selectedRows: [] | [string];
  onSelectionChange: (ids: string[]) => void;
}> = ({ volumes, selectedRows, onSelectionChange }) => {
  const [t] = useTranslation();
  const tableRows: TableRowData[] = volumes.map((v, i) => ({
    id: String(i),
    columns: [
      <Tooltip placement="bottom" label={v?.name} key={i}>
        <Row style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
          <ds-text as="span" color="gray0" weight="regular">
            {v?.name}
          </ds-text>
        </Row>
      </Tooltip>,
      <Tooltip placement="bottom" label={v?.name} key={i}>
        <Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
          <ds-text as="span" color="gray0" weight="regular">
            {v?.galAccount?.name ?? '-'}
          </ds-text>
        </Row>
      </Tooltip>,
    ],
    clickable: true,
  }));

  return (
    <Container mainAlignment="flex-start" crossAlignment="flex-start">
      <ListRow>
        <Container
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          width="fill"
          maxHeight="calc(100vh - 25rem)"
          minHeight="auto"
        >
          <Table
            headers={GalServerTableheaders(t)}
            rows={tableRows}
            showCheckbox={false}
            multiSelect={false}
            selectedRows={selectedRows}
            onSelectionChange={onSelectionChange}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Container>
      </ListRow>
      {tableRows.length === 0 && (
        <Container crossAlignment="center" mainAlignment="flex-start" style={{ marginTop: '1rem' }}>
          <Padding all="medium" width="30.875rem">
            <ds-text
              as="p"
              color="gray0"
              overflow="break-word"
              weight="regular"
              size="large"
              style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
            >
              {t('label.empty_table', 'Empty Table')}
            </ds-text>
          </Padding>
        </Container>
      )}
    </Container>
  );
};

const DomainGalSettings: FC = () => {
  const [t] = useTranslation();
  const measureUnitItems = MeasureUnitItems(t);
  const { data: selectedDomain, isLoading: isDomainLoading } = useSelectedDomain();
  const domain: { name?: string } = selectedDomain ?? {};
  const { data: allMailstoreList = [] } = useMailstoreServers();
  const { domainId } = useParams();
  const queryClient = useQueryClient();

  // === Dropdown state ===
  const [open, setOpen] = useState(false);
  const onClose = (): void => setOpen(false);
  const onOpen = (): void => setOpen(true);

  // === Form with TanStack Form ===
  const form = useForm({
    defaultValues: GAL_SETTINGS_DEFAULTS,
    validators: {
      onChange: galSettingsSchema,
      onSubmit: galSettingsSchema
    },
    onSubmit: async ({ value }) => {
      await saveDomainMutationFn(value);
      form.reset(value, { keepDefaultValues: true });
    }
  });

  // === Server table state ===
  const [serverList, setServerList] = useState<AccountDataType[]>([]);
  const [serverSelection, setServerSelection] = useState<[] | [string]>([]);

  // === Modal state ===
  const [modalState, setModalState] = useState({
    createOpen: false,
    destroyOpen: false,
    createToggle: false,
    destroyToggle: false
  });

  // === GAL account IDs for datasource operations ===
  const [galAccountIds, setGalAccountIds] = useState<Array<{ n: string; _content: string }>>([]);
  const [dataSourceIds, setDataSourceIds] = useState<
    Array<{ accountId: string; dataSourceId: string }>
  >([]);

  // === User settings ===
  const userSetting = useUserSettings();
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

  // === Mutations ===
  const saveDomainMutationFn = async (fs: GalSettingsFormValues): Promise<unknown[]> => {
    // Use domain ID from derived values as fallback (handles form sync timing)
    const effectiveZimbraId = fs.zimbraId || selectedDomain?.id || '';
    const domainAttrs: Attribute[] = [
      { n: 'zimbraGalMaxResults', _content: fs.maxResults },
      { n: 'zimbraGalLdapPageSize', _content: fs.ldapPageSize },
      { n: 'zimbraGalMode', _content: fs.galMode },
      { n: 'zimbraGalLdapURL', _content: fs.ldapUrl },
      { n: 'zimbraGalLdapStartTlsEnabled', _content: fs.ldapStartTlsEnabled ? TRUE : FALSE },
      { n: 'zimbraGalLdapFilter', _content: fs.ldapFilter },
      { n: 'zimbraGalLdapSearchBase', _content: fs.ldapSearchBase },
      { n: 'zimbraGalLdapBindDn', _content: fs.ldapBindDn },
      { n: 'zimbraGalLdapBindPassword', _content: fs.ldapBindPassword },
      { n: 'zimbraGalLdapAuthMech', _content: fs.ldapAuthMech }
    ];

    const requests: Promise<unknown>[] = [
      modifyDomain({ id: effectiveZimbraId, _jsns: ZIMBRA_ADMIN_URN, a: domainAttrs })
    ];

    const pollingIntervalStr = formatPollingInterval(fs.galPollingInterval);
    if (fs.galAccountId && galAccountIds.length > 0 && dataSourceIds.length > 0) {
      galAccountIds.forEach((item) => {
        const dsMatch = dataSourceIds.find((ds) => ds.accountId === item._content);
        if (dsMatch) {
          requests.push(
            modifyDataSource({
              id: item._content,
              _jsns: ZIMBRA_ADMIN_URN,
              dataSource: {
                id: dsMatch.dataSourceId,
                a: [
                  { n: 'zimbraGalType', _content: fs.galMode },
                  { n: 'zimbraDataSourcePollingInterval', _content: pollingIntervalStr }
                ]
              }
            })
          );
        }
      });
    }

    // Update GAL account polling interval
    if (galAccountIds.length > 0) {
      galAccountIds.forEach((item) => {
        requests.push(
          modifyAccountRequest(item._content, {
            zimbraDataSourceGalPollingInterval: pollingIntervalStr
          })
        );
      });
    }

    const results = await Promise.all(requests);
    if (isGlobalAdmin) {
      flushCache('domain', 'id', domainId);
    }
    return results;
  };

  const { isPending: isSaving } = useDomainMutation<unknown[], GalSettingsFormValues>({
    mutationFn: saveDomainMutationFn,
    successMessage: t('label.change_save_success_msg', 'The change has been saved successfully')
  });

  type CreateGalParams = {
    serverName: string;
    galDomainName: string;
  };

  const { mutate: createGalMutation, isPending: isCreating } = useDomainMutation<unknown, CreateGalParams>({
    mutationFn: async ({ serverName, galDomainName }) => {
      const attributes = [{ n: 'zimbraDataSourcePollingInterval', _content: '1d' }];
      const account = [{ by: 'name', _content: `${galDomainName}.${serverName}@${domain?.name}` }];
      return createGalSyncAccount(INTERNAL_GAL, domain?.name, serverName, account, ZIMBRA, attributes);
    },
    successMessage: t('label.create_galsync_account_success_msg', 'You have created the GALSync account name')
  });

  type DeleteGalParams = { accountId: string };

  const { mutate: deleteGalMutation, isPending: isDeleting } = useDomainMutation<unknown, DeleteGalParams>({
    mutationFn: async ({ accountId }) => destroyAccount(accountId),
    successMessage: t('label.changes_save_success_msg', 'Your changes has been saved!')
  });

  type ReSyncParams = { accountIds: string[] };

  const { mutate: reSyncMutation, isPending: isResyncing } = useDomainMutation<unknown, ReSyncParams>({
    mutationFn: async ({ accountIds }) => {
      await Promise.all(accountIds.map((id) => reSyncGalAccount(id)));
    },
    successMessage: t('label.gal_successfully_re_synced', 'GAL successfully re-synced')
  });

  // === Derived state ===
  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  // === Derive form values from domain (stable for first render) ===
  const derivedValues = parseGalFormFromAttributes(selectedDomain?.a);

  // Track user-modified galMode separately
  const [userModifiedGalMode, setUserModifiedGalMode] = useState<string | null>(null);

  // State for data fetching
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);

  // Track user modifications locally for immediate UI feedback
  const [localOverrides, setLocalOverrides] = useState<Partial<GalSettingsFormValues>>({});

  // Sync form when domain changes (sync render pattern)
  const [lastSyncedDomainId, setLastSyncedDomainId] = useState<string | undefined>(undefined);

  if (derivedValues?.zimbraId && derivedValues.zimbraId !== lastSyncedDomainId) {
    setLastSyncedDomainId(derivedValues.zimbraId);
    form.reset(derivedValues as GalSettingsFormValues, { keepDefaultValues: false });
    setUserModifiedGalMode(null);
    setLocalOverrides({}); // Clear local overrides on domain change
    const accountIds = selectedDomain?.a?.filter((a: Attribute) => a.n === 'zimbraGalAccountId') ?? [];
    setGalAccountIds(accountIds);
    setHasFetchedInitialData(false);
  }

  // Display values: merge derivedValues with local overrides for immediate UI feedback
  const baseValues = derivedValues ?? GAL_SETTINGS_DEFAULTS;
  const displayValues = { ...baseValues, ...localOverrides } as GalSettingsFormValues;

  const measureUnitSelection = measureUnitItems.find((item) => item.value === displayValues.galPollingInterval.unit) ?? measureUnitItems[0];

  // === Button disable state (derived from selection) ===
  const selectedServer = serverSelection.length > 0 ? serverList[Number(serverSelection[0])] : null;
  const isCreateBtnDisabled = selectedServer?.galAccount !== null;
  const isDestroyBtnDisabled = !selectedServer || selectedServer.galAccount === null;

  // === Helper functions for server list ===
  const setEmptyServerList = (): void => {
    setServerList(
      allMailstoreList.map((server: Server) => ({
        name: server.name,
        id: server.id,
        galAccount: null
      }))
    );
  };

  const buildServerList = (
    galAccountsData: Array<{ accountData: Attribute[]; name: string; id: string } | undefined>
  ): void => {
    const result = allMailstoreList.map((server: Server) => {
      const matchingAccount = galAccountsData.find(
        (acc) => acc && server.name === acc.accountData?.[0]?._content
      );
      return {
        name: server.name,
        id: server.id,
        galAccount: matchingAccount
          ? {
              server: matchingAccount.accountData?.[0]?._content ?? '',
              name: matchingAccount.name,
              id: matchingAccount.id
            }
          : null
      };
    });
    setServerList(result);
  };

  // Effective galMode for conditional rendering
  const effectiveGalMode = userModifiedGalMode ?? derivedValues?.galMode ?? 'zimbra';

  const getGalModeLabel = (): string => {
    if (!effectiveGalMode || effectiveGalMode === 'zimbra') return 'Internal';
    if (effectiveGalMode === 'ldap') return 'External';
    return 'Both';
  };
  const galModeLabel = getGalModeLabel();

  // === Fetch helpers (declared before use to avoid hoisting issues) ===
  const fetchPollingIntervalFromAccount = (accountId: string): void => {
    getAccount(accountId).then((data) => {
      const galAccount = data?.account?.[0];
      const parsed = galAccount ? extractPollingInterval(galAccount) : null;
      if (parsed) {
        form.setFieldValue('galPollingInterval', parsed);
      }
    });
  };

  const fetchDataSourceForAccount = (accountId: string): void => {
    getDatasource(accountId).then((data) => {
      const dataSource = data?.dataSource?.[0];
      if (!dataSource?.id) {
        return;
      }
      const isDuplicate = dataSourceIds.some((d) => d.accountId === accountId);
      if (!isDuplicate) {
        setDataSourceIds((prev) => [...prev, { accountId, dataSourceId: dataSource.id }]);
      }
    });
  };

  // Fetch GAL data after domain data is available (runs once per domain change)
  if (derivedValues?.zimbraId && !hasFetchedInitialData && selectedDomain?.a) {
    setHasFetchedInitialData(true);
    const galAccountAttrs = selectedDomain.a.filter((item: Attribute) => item.n === 'zimbraGalAccountId');

    if (galAccountAttrs.length === 0) {
      setEmptyServerList();
    } else {
      Promise.all(galAccountAttrs.map((item: Attribute) => fetchGalAccountInfo(item._content))).then(
        buildServerList
      );
    }

    if (derivedValues.galAccountId) {
      fetchPollingIntervalFromAccount(derivedValues.galAccountId);
      galAccountIds.forEach((item) => fetchDataSourceForAccount(item._content));
    }
  }

  const closeHandler = (): void => {
    setModalState((prev) => ({ ...prev, createOpen: false, destroyOpen: false }));
  };

  const changeGalModeBtnItems: DropdownItem[] = [
    {
      id: 'internal',
      label: t('domain.gal_change_mode_internal', 'Internal'),
      selected: effectiveGalMode === 'zimbra',
      onClick: (): void => {
        form.setFieldValue('galMode', 'zimbra');
        setUserModifiedGalMode('zimbra');
      }
    },
    {
      id: 'external',
      label: t('domain.gal_change_mode_external', 'External'),
      selected: effectiveGalMode === 'ldap',
      onClick: (): void => {
        form.setFieldValue('galMode', 'ldap');
        setUserModifiedGalMode('ldap');
      }
    }
  ];

  const onCancel = (): void => {
    form.reset();
    setUserModifiedGalMode(null); // Reset to domain value
    setLocalOverrides({}); // Clear local overrides
  };

  const onSave = (): void => {
    form.handleSubmit();
  };

  // === Form field handlers ===
  // Each handler updates both the form store (for submission) and localOverrides (for immediate UI)
  const onMaxResultsChange = (ev: ChangeEvent<HTMLInputElement>): void => {
    const value = ev.target.value;
    form.setFieldValue('maxResults', value);
    setLocalOverrides(prev => ({ ...prev, maxResults: value }));
  };

  const onLdapPageSizeChange = (ev: ChangeEvent<HTMLInputElement>): void => {
    const value = ev.target.value;
    form.setFieldValue('ldapPageSize', value);
    setLocalOverrides(prev => ({ ...prev, ldapPageSize: value }));
  };

  const onLdapUrlChange = (ev: ChangeEvent<HTMLInputElement>): void => {
    const value = ev.target.value;
    form.setFieldValue('ldapUrl', value);
    setLocalOverrides(prev => ({ ...prev, ldapUrl: value }));
  };

  const onLdapStartTlsChange = (): void => {
    const newValue = !displayValues.ldapStartTlsEnabled;
    form.setFieldValue('ldapStartTlsEnabled', newValue);
    setLocalOverrides(prev => ({ ...prev, ldapStartTlsEnabled: newValue }));
  };

  const onLdapFilterChange = (ev: ChangeEvent<HTMLInputElement>): void => {
    const value = ev.target.value;
    form.setFieldValue('ldapFilter', value);
    setLocalOverrides(prev => ({ ...prev, ldapFilter: value }));
  };

  const onLdapSearchBaseChange = (ev: ChangeEvent<HTMLInputElement>): void => {
    const value = ev.target.value;
    form.setFieldValue('ldapSearchBase', value);
    setLocalOverrides(prev => ({ ...prev, ldapSearchBase: value }));
  };

  const onLdapBindDnChange = (ev: ChangeEvent<HTMLInputElement>): void => {
    const value = ev.target.value;
    form.setFieldValue('ldapBindDn', value);
    setLocalOverrides(prev => ({ ...prev, ldapBindDn: value }));
  };

  const onLdapBindPasswordChange = (ev: ChangeEvent<HTMLInputElement>): void => {
    const value = ev.target.value;
    form.setFieldValue('ldapBindPassword', value);
    setLocalOverrides(prev => ({ ...prev, ldapBindPassword: value }));
  };

  const onLdapAuthMechChange = (): void => {
    const newValue = displayValues.ldapAuthMech === 'none' ? 'simple' : 'none';
    form.setFieldValue('ldapAuthMech', newValue);
    setLocalOverrides(prev => ({ ...prev, ldapAuthMech: newValue }));
  };

  const onPollingValueChange = (ev: ChangeEvent<HTMLInputElement>): void => {
    const value = ev.target.value;
    if (Number.parseInt(value, 10) < 0) return;
    const newPolling = { ...displayValues.galPollingInterval, value };
    form.setFieldValue('galPollingInterval', newPolling);
    setLocalOverrides(prev => ({ ...prev, galPollingInterval: newPolling }));
  };

  const onPollingUnitChange = (unit: string | null): void => {
    if (!unit) return;
    const newPolling = { ...displayValues.galPollingInterval, unit: unit as PollingUnit };
    form.setFieldValue('galPollingInterval', newPolling);
    setLocalOverrides(prev => ({ ...prev, galPollingInterval: newPolling }));
  };

  const fetchGalSyncAccounts = (domainAttrs: Attribute[] | undefined): void => {
    const galAccountAttrs = domainAttrs?.filter((item: Attribute) => item.n === 'zimbraGalAccountId') ?? [];
    if (galAccountAttrs.length === 0) {
      setEmptyServerList();
      return;
    }
    Promise.all(galAccountAttrs.map((item: Attribute) => fetchGalAccountInfo(item._content))).then(
      buildServerList
    );
  };

  const refreshDomainData = (id: string): void => {
    flushCache('all').then(() => {
      getDomainInformation(id, 1).then((data: { domain?: Array<{ id: string; a?: Attribute[] }> }) => {
        const domainData = data?.domain?.[0];
        if (domainData) {
          queryClient.setQueryData(domainByIdKey(domainId, 1), domainData);
          const newFormState = parseGalFormFromAttributes(domainData.a);
          if (newFormState) {
            form.reset(newFormState as GalSettingsFormValues, { keepDefaultValues: false });
          }
          fetchGalSyncAccounts(domainData.a);
        }
      });
    });
  };

  const createHandler = (
    accountData: { id?: string; name: string; galAccount?: null },
    galDomainName: string
  ): void => {
    if (!domainId) return;
    createGalMutation({
      serverName: accountData.name,
      galDomainName
    }).then((result) => {
      if (result) {
        refreshDomainData(domainId);
        setModalState((prev) => ({ ...prev, createOpen: false }));
      }
    });
  };

  const deleteHandler = (destroyData: {
    id?: string;
    name?: string;
    galAccount: { id: string; name: string; server: string };
  }): void => {
    if (!domainId) return;
    deleteGalMutation({ accountId: destroyData.galAccount.id }).then((result) => {
      if (result !== undefined) {
        refreshDomainData(domainId);
        setModalState((prev) => ({ ...prev, destroyOpen: false }));
      }
    });
  };

  const handleReSyncGalAccount = (): void => {
    const accountIds = serverList
      .map((item) => item.galAccount?.id)
      .filter((id): id is string => id !== undefined);
    reSyncMutation({ accountIds });
  };

  // Combined loading state for operations
  const isOperationPending = isCreating || isDeleting || isResyncing;

  if (isDomainLoading) {
    return (
      <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
        <ds-page-shimmer rows={6} />
      </Container>
    );
  }

  return (
    <Container padding={{ all: 'large' }} background="gray6" mainAlignment="flex-start">
      <Row mainAlignment="flex-start" width="100%">
        <Container orientation="vertical" mainAlignment="space-around" height="4rem">
          <Row orientation="horizontal" width="100%">
            <Row
              padding={{ all: 'large' }}
              mainAlignment="flex-start"
              width="50%"
              crossAlignment="flex-start"
            >
              <ds-text as="h2" size="medium" weight="bold" color="gray0">
                {t('label.global_address_list', 'Global Address List')}
              </ds-text>
            </Row>
            <DomainFormActions
              isDirty={isDirty}
              isPending={isSaving}
              onCancel={onCancel}
              onSave={onSave}
            />
          </Row>
        </Container>
      </Row>
      <ds-divider></ds-divider>

      <Container
        orientation="column"
        background="gray6"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflow: 'auto' }}
      >
        {modalState.createToggle && (
          <CreateGalsyncAccountModel
            open={modalState.createOpen}
            closeHandler={closeHandler}
            saveHandler={createHandler}
            accountData={serverList[Number(serverSelection[0])]}
          />
        )}
        {modalState.destroyToggle && (
          <DistroyGalsyncAccountModel
            open={modalState.destroyOpen}
            closeHandler={closeHandler}
            saveHandler={deleteHandler}
            accountData={serverList[Number(serverSelection[0])]}
          />
        )}
        <Padding vertical="medium" />
        <Row orientation="horizontal" width="100%" background="gray6">
          <Row
            width="100%"
            mainAlignment="flex-end"
            orientation="horizontal"
            padding={{ top: 'extralarge', right: 'large', left: 'large' }}
            style={{ gap: '1rem' }}
          >
            <Button
              type="outlined"
              label={t('label.create', 'CREATE')}
              color="primary"
              onClick={(): void => {
                setModalState((prev) => ({ ...prev, createToggle: true, createOpen: true }));
              }}
              disabled={isCreateBtnDisabled || isOperationPending}
            />
            <Button
              type="outlined"
              label={t('label.re_sync', 'RE-SYNC')}
              color="primary"
              onClick={handleReSyncGalAccount}
              loading={isResyncing}
              disabled={isOperationPending}
            />
            <Button
              type="ghost"
              label={t('label.destroy', 'DELETE')}
              color="error"
              onClick={(): void => {
                setModalState((prev) => ({ ...prev, destroyToggle: true, destroyOpen: true }));
              }}
              disabled={isDestroyBtnDisabled || isOperationPending}
            />
          </Row>
        </Row>
        <Row padding={{ top: 'extralarge' }} width="100%">
          <ServerListTable
            volumes={serverList}
            selectedRows={serverSelection}
            onSelectionChange={(ids: string[]): void => {
              setServerSelection(ids.length > 0 ? [ids[0]] : []);
            }}
          />
        </Row>
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          width="100%"
          height="fit"
        >
          <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
            <Container height="fit" crossAlignment="flex-start" background="gray6">
              <Row
                mainAlignment="flex-start"
                width="100%"
                background="gray6"
                padding={{ all: 'small' }}
              >
                <ds-text as="h3" size="small" weight="bold">
                  {t('account_details.general', 'General')}
                </ds-text>
              </Row>
              <ListRow>
                <Container orientation="horizontal">
                  <Container width="15rem" minWidth="11rem" mainAlignment="flex-start">
                    <Dropdown items={changeGalModeBtnItems} onOpen={onOpen} onClose={onClose}>
                      <Button
                        type="outlined"
                        size="extralarge"
                        label={t('label.change_to', 'CHANGE TO')}
                        icon={open ? 'ChevronUp' : 'ChevronDown'}
                        onClick={(): void => undefined}
                      />
                    </Dropdown>
                  </Container>
                  <Padding left="small" width="100%">
                    <LabeledValue
                      label={t('label.gal_mode', 'GAL Mode')}
                      value={galModeLabel}
                      backgroundColor="gray6"
                    />
                  </Padding>
                </Container>
              </ListRow>
              <Container padding={{ all: 'small' }}>
                <Input
                  isRequired
                  type="number"
                  label={t(
                    'label.limit_search_results_from_address_book_list_to',
                    'Limit search results from Address Book List to'
                  )}
                  value={displayValues.maxResults ?? ''}
                  backgroundColor="gray5"
                  onChange={onMaxResultsChange}
                />
              </Container>
              <Container padding={{ all: 'small' }}>
                <Input
                  isRequired
                  type="number"
                  label={t('domain.page_size', 'Page Size')}
                  value={displayValues.ldapPageSize ?? ''}
                  backgroundColor="gray5"
                  onChange={onLdapPageSizeChange}
                />
              </Container>
            </Container>
          </Row>
        </Container>
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          width="100%"
          height="fit"
        >
          <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
            <Container height="fit" crossAlignment="flex-start" background="gray6">
              <Row
                mainAlignment="flex-start"
                width="100%"
                background="gray6"
                padding={{ all: 'small' }}
              >
                <ds-text as="h3" size="small" weight="bold">
                  {t('label.settings', 'Settings')}
                </ds-text>
              </Row>
              <ListRow>
                <Container padding={{ all: 'small' }}>
                  <Input
                    label={t('label.gal_update_frequencey_value', 'GAL Update Frequency (value)')}
                    value={displayValues.galPollingInterval.value ?? ''}
                    backgroundColor="gray5"
                    onChange={onPollingValueChange}
                  />
                </Container>
                <Container padding={{ all: 'small' }}>
                  <Select
                    items={measureUnitItems}
                    background="gray5"
                    label={t('label.interval', 'Interval')}
                    onChange={onPollingUnitChange}
                    showCheckbox={false}
                    selection={measureUnitSelection}
                  />
                </Container>
              </ListRow>
            </Container>
          </Row>
        </Container>

        {effectiveGalMode === 'ldap' && (
          <>
            <Container
              orientation="column"
              crossAlignment="flex-start"
              mainAlignment="flex-start"
              width="100%"
              height="fit"
            >
              <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
                <Container height="fit" crossAlignment="flex-start" background="gray6">
                  <Row
                    mainAlignment="flex-start"
                    width="100%"
                    background="gray6"
                    padding={{ all: 'small' }}
                  >
                    <ds-text as="h3" size="small" weight="bold">
                      {t('label.ldap_url', 'LDAP Url')}
                    </ds-text>
                  </Row>
                  <Row
                    orientation="horizontal"
                    mainAlignment="space-between"
                    crossAlignment="center"
                    width="fill"
                    wrap="nowrap"
                  >
                    <Container padding={{ all: 'small' }}>
                      <Input
                        label={t('label.external_server_address', 'External Server Address')}
                        value={displayValues.ldapUrl ?? ''}
                        backgroundColor="gray5"
                        onChange={onLdapUrlChange}
                        CustomIcon={createInfoIcon(EXTERNAL_SERVER_EXAMPLE)}
                      />
                    </Container>

                    <Container
                      width="10%"
                      orientation="horizontal"
                      mainAlignment="flex-start"
                      crossAlignment="center"
                    >
                      <Switch
                        defaultChecked={displayValues.ldapStartTlsEnabled ?? false}
                        onClick={onLdapStartTlsChange}
                        label={t('label.user_ssl', 'Use SSL')}
                        value={displayValues.ldapStartTlsEnabled ?? false}
                      />
                    </Container>
                  </Row>
                  <Container padding={{ all: 'small' }}>
                    <Input
                      label={t('label.ldap_filter', 'LDAP Filter')}
                      value={displayValues.ldapFilter ?? ''}
                      backgroundColor="gray5"
                      onChange={onLdapFilterChange}
                      CustomIcon={createInfoIcon(LDAP_FILTER_LABEL)}
                    />
                  </Container>
                  <Container padding={{ all: 'small' }}>
                    <Input
                      label={t('label.ldap_search_base', 'LDAP based search')}
                      value={displayValues.ldapSearchBase ?? ''}
                      backgroundColor="gray5"
                      onChange={onLdapSearchBaseChange}
                      CustomIcon={createInfoIcon(LDAP_SEARCH_BASE_LABEL)}
                    />
                  </Container>
                </Container>
              </Row>
            </Container>

            <Container height="fit" padding={{ all: 'small' }}>
              <ds-divider></ds-divider>
            </Container>

            <Container
              orientation="column"
              crossAlignment="flex-start"
              mainAlignment="flex-start"
              width="100%"
              height="fit"
            >
              <Row
                mainAlignment="flex-start"
                width="100%"
                background="gray6"
                padding={{ all: 'small' }}
              >
                <ds-text as="h3" size="small" weight="bold">
                  {t('label.authentication_settings', 'Authentication Settings')}
                </ds-text>
              </Row>
              <ListRow>
                <Container
                  orientation="horizontal"
                  mainAlignment="flex-start"
                  crossAlignment="center"
                  padding={{ all: 'small' }}
                >
                  <Switch
                    defaultChecked={displayValues.ldapAuthMech === 'simple'}
                    onClick={onLdapAuthMechChange}
                    label={t(
                      'label.external_server_needs_authentication',
                      'External Server needs authentication'
                    )}
                    value={displayValues.ldapAuthMech === 'simple'}
                  />
                </Container>
              </ListRow>
              <ListRow>
                <Container padding={{ all: 'small' }}>
                  <Input
                    label={t('label.bind_dn', 'Bind DN')}
                    value={displayValues.ldapBindDn ?? ''}
                    backgroundColor="gray5"
                    onChange={onLdapBindDnChange}
                    CustomIcon={createInfoIcon(LDAP_BIND_DN_LABLE)}
                  />
                </Container>
                <Container padding={{ all: 'small' }}>
                  <Input
                    label={t('label.password', 'Password')}
                    value={displayValues.ldapBindPassword ?? ''}
                    backgroundColor="gray5"
                    onChange={onLdapBindPasswordChange}
                  />
                </Container>
              </ListRow>
            </Container>
          </>
        )}
      </Container>
      <RouteLeavingGuard when={isDirty} onSave={onSave} />
    </Container>
  );
};

export default DomainGalSettings;
