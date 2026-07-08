/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  FormPageLayout,
  Padding,
  Row,
  Tooltip,
  type TRow,
} from '@zextras/ui-components';
import type { DirectoryEntry } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Attribute } from '../../../../types/attribute';
import { DEFAULT, RECORD_DISPLAY_LIMIT, ZIMBRA_ADMIN_URN } from '../../../constants';
import { useDebouncedValue } from '../../../hooks/use-debounced-value';
import { ModifyCosBody } from '../../../services/modify-cos-service';
import { useCosAccounts } from '../../../services/use-cos-accounts';
import { useCosDomains } from '../../../services/use-cos-domains';
import { useModifyCos } from '../../../services/use-modify-cos';
import { useRenameCos } from '../../../services/use-rename-cos';
import { useTotalAccounts } from '../../../services/use-total-accounts';
import { useTotalDomains } from '../../../services/use-total-domains';
import { getDateFromStr, getFormatedDate } from '../../utility/utils';
import { CosInfoFields, type GeneralInfoFormValues } from './cos-info-fields';
import { DeleteCosModal } from './delete-cos-modal';
import { SearchableTable } from './searchable-table';

type AttributeMap = Partial<Record<string, string | Array<string>>>;

type GeneralInformationFormProps = {
  cosInformation: Array<Attribute> | undefined;
  readonlyCOS: boolean;
};

const ACCOUNT_STATUS_COLORS = {
  active: 'success',
  maintenance: 'info',
  locked: 'error',
  closed: 'gray1',
  pending: 'gray1',
  lockout: 'error',
} as const;

type StatusColorMap = Record<string, { color: string; label: string }>;

function buildStatusColorMap(t: (key: string, defaultValue: string) => string): StatusColorMap {
  return {
    active: { color: ACCOUNT_STATUS_COLORS.active, label: t('label.active', 'Active') },
    maintenance: {
      color: ACCOUNT_STATUS_COLORS.maintenance,
      label: t('label.in_maintenance', 'In maintenance'),
    },
    locked: { color: ACCOUNT_STATUS_COLORS.locked, label: t('label.locked', 'Locked') },
    closed: { color: ACCOUNT_STATUS_COLORS.closed, label: t('label.closed', 'Closed') },
    pending: { color: ACCOUNT_STATUS_COLORS.pending, label: t('label.pending', 'Pending') },
    lockout: { color: ACCOUNT_STATUS_COLORS.lockout, label: t('label.lockout', 'Lockout') },
  };
}

function flattenAttributes(
  attributes: Array<Attribute> | undefined,
  arrayFields: Set<string>,
): AttributeMap {
  const map: AttributeMap = {};
  attributes?.forEach((ele) => {
    const attrName = ele?.n;
    if (!attrName) return;
    if (arrayFields.has(attrName)) {
      const existing = map[attrName];
      if (Array.isArray(existing)) {
        existing.push(ele._content);
      } else {
        map[attrName] = [ele._content];
      }
    } else {
      map[attrName] = ele._content;
    }
  });
  return map;
}

function getStringAttr(map: AttributeMap, key: string): string {
  const val = map[key];
  return typeof val === 'string' ? val : '';
}

function getStringArrayAttr(map: AttributeMap, key: string): Array<string> {
  const val = map[key];
  return Array.isArray(val) ? val : [];
}

function getUserType(attrs: AttributeMap): string {
  if (getStringAttr(attrs, 'zimbraIsAdminAccount') === 'TRUE') return 'Admin';
  if (getStringAttr(attrs, 'zimbraIsDelegatedAdminAccount') === 'TRUE') return 'DelegatedAdmin';
  if (getStringAttr(attrs, 'zimbraIsExternalVirtualAccount') === 'TRUE') return 'External';
  if (getStringAttr(attrs, 'zimbraIsSystemAccount') === 'TRUE') return 'System';
  return 'Normal';
}

function processAccountItem(item: DirectoryEntry, statusColor: StatusColorMap): TRow {
  const attrs = flattenAttributes(item.a, new Set(['mail']));
  const mailAddresses = getStringArrayAttr(attrs, 'mail');
  const aliasCount = mailAddresses.length - 1;
  const accountStatus = getStringAttr(attrs, 'zimbraAccountStatus');

  return {
    id: item.id,
    columns: [
      <ds-text as="span" size="small" key={item.id} color="gray0" weight="regular">
        {item.name || ' '}
      </ds-text>,
      <ds-text as="span" size="small" key={item.id} color="gray0" weight="light">
        {getStringAttr(attrs, 'displayName') || <>&nbsp;</>}
      </ds-text>,
      <>
        {aliasCount > 0 ? (
          <Tooltip
            key={item.id}
            placement="bottom"
            label={mailAddresses.slice(1).join(', ')}
            maxWidth="auto"
          >
            <ds-text as="span" size="small" weight="light" key={item.id} color="gray1">
              {aliasCount}
            </ds-text>
          </Tooltip>
        ) : (
          <ds-text as="span" size="small" key={item.id} color="gray1" weight="light">
            0
          </ds-text>
        )}
      </>,
      <ds-text as="span" size="small" key={item.id} color="gray0" weight="light">
        {getUserType(attrs)}
      </ds-text>,
      <ds-text
        as="span"
        size="small"
        weight="light"
        key={item.id}
        color={statusColor[accountStatus]?.color}
      >
        {statusColor[accountStatus]?.label}
      </ds-text>,
      <ds-text as="span" size="small" weight="light" key={item.id} color="gray0">
        {getStringAttr(attrs, 'description') || <>&nbsp;</>}
      </ds-text>,
    ],
    clickable: true,
  };
}

function processDomainItem(
  item: DirectoryEntry,
  cosId: string | undefined,
  defaultCosLabel: string,
): TRow {
  const attrs = flattenAttributes(item.a, new Set(['zimbraDomainCOSMaxAccounts']));
  const cosMaxAccounts = getStringArrayAttr(attrs, 'zimbraDomainCOSMaxAccounts');
  const maxAccountValue = cosMaxAccounts
    .find((acc) => acc?.split(':')[0] === cosId)
    ?.split(':')[1];
  const defaultCOSId = getStringAttr(attrs, 'zimbraDomainDefaultCOSId');

  return {
    id: item.id,
    columns: [
      <ds-text as="span" size="small" key={item.id} color="gray0" weight="regular">
        {item.name || ' '}
      </ds-text>,
      <ds-text as="span" size="small" key={item.id} color="gray0" weight="light">
        {maxAccountValue || ' '}
      </ds-text>,
      <Container key={item.id}>
        {cosId === defaultCOSId && (
          <Row>
            <Padding right="small">
              <ds-text as="span" size="small" weight="light" color="gray0">
                {defaultCosLabel}
              </ds-text>
            </Padding>
            <ds-icon icon="Star" color="primary"></ds-icon>
          </Row>
        )}
      </Container>,
    ],
    clickable: true,
  };
}

function attributesToMap(
  cosInformation: Array<Attribute> | undefined,
): Partial<Record<string, string>> {
  if (!cosInformation?.length) return {};
  const map: Partial<Record<string, string>> = {};
  cosInformation.forEach((item) => {
    if (item?.n) map[item.n] = item._content;
  });
  return map;
}

function buildDefaultValues(cosInformation: Array<Attribute> | undefined): GeneralInfoFormValues {
  const fromServer = attributesToMap(cosInformation);
  return {
    cn: fromServer.cn ?? '',
    description: fromServer.description ?? '',
    zimbraNotes: fromServer.zimbraNotes ?? '',
  };
}

function buildAccountList(
  accounts: Array<DirectoryEntry> | undefined,
  statusColor: StatusColorMap,
): Array<TRow> {
  if (!accounts?.length) return [];
  return accounts.map((item) => processAccountItem(item, statusColor));
}

function buildDomainList(
  domains: Array<DirectoryEntry> | undefined,
  cosId: string | undefined,
  defaultCosLabel: string,
): Array<TRow> {
  if (!domains?.length) return [];
  return domains.map((item) => processDomainItem(item, cosId, defaultCosLabel));
}

export const GeneralInformationForm = ({
  cosInformation,
  readonlyCOS,
}: GeneralInformationFormProps) => {
  const [t] = useTranslation();
  const { cosId } = useParams();
  const modifyCosMutation = useModifyCos(cosId);
  const renameCosMutation = useRenameCos();
  const { data: totalAccount = 0 } = useTotalAccounts(cosId);
  const { data: totalDomain = 0 } = useTotalDomains(cosId);

  const [openDeleteCOSConfirmDialog, setOpenDeleteCOSConfirmDialog] = useState<boolean>(false);

  const [offset, setOffset] = useState<number>(0);
  const [accountPageSize, setAccountPageSize] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [searchAccountString, setSearchAccountString] = useState<string>('');
  const debouncedAccountSearch = useDebouncedValue(searchAccountString, 700);

  const [domainPageSize, setDomainPageSize] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [searchDomainString, setSearchDomainString] = useState<string>('');
  const [domainOffset, setDomainOffset] = useState<number>(0);
  const debouncedDomainSearch = useDebouncedValue(searchDomainString, 700);

  const STATUS_COLOR = buildStatusColorMap(t);

  const {
    data: accountsData,
    isPending: isAccountRequestInProgress,
    isFetching: isAccountFetching,
    isPlaceholderData: isAccountPlaceholderData,
  } = useCosAccounts(cosId, debouncedAccountSearch, offset, accountPageSize);

  const accountList = buildAccountList(accountsData?.accounts, STATUS_COLOR);

  const totalAccounts = accountsData?.total ?? 0;

  const {
    data: domainsData,
    isPending: isDomainRequestInProgress,
    isFetching: isDomainFetching,
    isPlaceholderData: isDomainPlaceholderData,
  } = useCosDomains(cosId, debouncedDomainSearch, domainOffset, domainPageSize);

  const domainList = buildDomainList(
    domainsData?.domains,
    cosId,
    t('label.default_cos', 'Default COS'),
  );

  const totalDomains = domainsData?.total ?? 0;

  const cosData = attributesToMap(cosInformation);

  const form = useForm({
    defaultValues: buildDefaultValues(cosInformation),
    onSubmit: async ({ value }) => {
      const zimbraId = cosInformation?.find((a) => a.n === 'zimbraId')?._content;
      if (!zimbraId) return;

      const originalCn = cosData.cn ?? '';
      const attributes: Attribute[] = [
        { n: 'zimbraNotes', _content: value.zimbraNotes },
        { n: 'description', _content: value.description },
        { n: 'cn', _content: value.cn, c: true },
      ];
      const body: ModifyCosBody = {
        _jsns: ZIMBRA_ADMIN_URN,
        a: attributes,
        id: { _content: zimbraId },
      };

      if (originalCn === value.cn) {
        modifyCosMutation.mutate(body, {
          onSuccess: () => {
            form.reset(value, { keepDefaultValues: true });
          },
        });
      } else {
        const renameBody = {
          _jsns: ZIMBRA_ADMIN_URN,
          id: { _content: zimbraId },
          newName: { _content: value.cn },
        };
        await renameCosMutation.mutateAsync(renameBody);
        modifyCosMutation.mutate(body, {
          onSuccess: () => {
            form.reset(value, { keepDefaultValues: true });
          },
        });
      }
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  const accountHeaders = [
    { id: 'email', label: t('label.email', 'Email'), width: '25%', bold: true },
    { id: 'name', label: t('label.person_name', 'Name'), width: '15%', bold: true },
    { id: 'aliases', label: t('label.Aliases', 'Aliases'), width: '10%', bold: true },
    { id: 'type', label: t('label.type', 'Type'), width: '10%', bold: true },
    { id: 'status', label: t('label.status', 'Status'), width: '10%', bold: true },
    { id: 'description', label: t('label.description', 'Description'), width: '40%', bold: true },
  ];

  const domainHeaders = [
    { id: 'domains', label: t('label.domains', 'Domains'), width: '35%', bold: true },
    {
      id: 'maximum_accounts',
      label: t('label.maximum_handled_accounts', 'Maximum Handled Accounts'),
      width: '45%',
      bold: true,
    },
    { id: 'description', label: '', width: '20%', bold: true },
  ];

  const cosCreationDate =
    !!cosData.zimbraCreateTimestamp && cosData.zimbraCreateTimestamp !== null
      ? getFormatedDate(getDateFromStr(cosData.zimbraCreateTimestamp)) ?? ''
      : '';

  const canDeleteCOS = form.state.values.cn === '' || form.state.values.cn === DEFAULT;

  return (
    <FormPageLayout
      title={t('cos.general_information', 'General Information')}
      onSave={() => form.handleSubmit()}
      onCancel={() => form.reset()}
      unsavedChanges={isDirty}
    >
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflow: 'auto' }}
        width="100%"
      >
        <CosInfoFields
          form={form}
          cosId={cosData.zimbraId}
          cosCreationDate={cosCreationDate}
          totalAccount={totalAccount}
          totalDomain={totalDomain}
          canDeleteCOS={canDeleteCOS}
          readonlyCOS={readonlyCOS}
        />
        <SearchableTable
          title={t('cos.domains_that_use_this_cos', 'Domains that use this COS')}
          searchLabel={t('label.search_for_a_domain', 'Search for a domain')}
          searchValue={searchDomainString}
          onSearchChange={setSearchDomainString}
          rows={domainList}
          headers={domainHeaders}
          totalItems={totalDomains}
          pageSize={domainPageSize}
          onOffsetChange={setDomainOffset}
          onPageSizeChange={setDomainPageSize}
          isPending={isDomainRequestInProgress}
          isFetching={isDomainFetching}
          isPlaceholderData={isDomainPlaceholderData}
        />
        <SearchableTable
          title={t('cos.accounts_that_use_this_cos', 'Accounts that use this COS')}
          searchLabel={t('label.search_for_an_account', 'Search for an account')}
          searchValue={searchAccountString}
          onSearchChange={setSearchAccountString}
          rows={accountList}
          headers={accountHeaders}
          totalItems={totalAccounts}
          pageSize={accountPageSize}
          onOffsetChange={setOffset}
          onPageSizeChange={setAccountPageSize}
          isPending={isAccountRequestInProgress}
          isFetching={isAccountFetching}
          isPlaceholderData={isAccountPlaceholderData}
          hasBottomPadding
          marginTopStyle={{ marginTop: domainList.length > 0 ? '3rem' : '0rem' }}
        />
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
          onClick={() => setOpenDeleteCOSConfirmDialog(true)}
        />
      </Row>
      <DeleteCosModal
        open={openDeleteCOSConfirmDialog}
        onClose={(): void => setOpenDeleteCOSConfirmDialog(false)}
        cosName={form.state.values.cn}
        cosId={cosData.zimbraId ?? ''}
      />
    </FormPageLayout>
  );
};
