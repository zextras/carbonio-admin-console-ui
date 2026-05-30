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
  CustomTextArea,
  Input,
  LabeledValue,
  ListRow,
  Padding,
  Row,
  Tooltip,
  type TRow,
  useSnackbar,
} from '@zextras/ui-components';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Attribute } from '../../../../types/attribute';
import { DEFAULT, RECORD_DISPLAY_LIMIT, ZIMBRA_ADMIN_URN } from '../../../constants';
import { useDebouncedValue } from '../../../hooks/use-debounced-value';
import { ModifyCosBody } from '../../../services/modify-cos-service';
import { renameCos } from '../../../services/rename-cos-service';
import { useCosAccounts } from '../../../services/use-cos-accounts';
import { useCosDomains } from '../../../services/use-cos-domains';
import { useModifyCos } from '../../../services/use-modify-cos';
import { useTotalAccounts } from '../../../services/use-total-accounts';
import { useTotalDomains } from '../../../services/use-total-domains';
import { FormPageLayout } from '../../form-page-layout';
import { getDateFromStr, getFormatedDate } from '../../utility/utils';
import { DeleteCosModal } from './delete-cos-modal';
import { SearchableTable } from './searchable-table';

type DirectoryItem = {
  a?: Array<Attribute>;
  id?: string;
  name?: string;
};

type GeneralInfoFormValues = {
  cn: string;
  description: string;
  zimbraNotes: string;
};

type GeneralInformationFormProps = {
  cosInformation: Array<Attribute> | undefined;
  readonlyCOS: boolean;
};

function processAttributes(
  attributes: Array<Attribute> | undefined,
  record: Record<string, unknown>,
  arrayFieldName: string,
): void {
  attributes?.forEach((ele) => {
    const attrName = ele?.n;
    if (!attrName) return;
    if (attrName === arrayFieldName) {
      const existing = record[attrName];
      if (Array.isArray(existing)) {
        existing.push(ele._content);
      } else {
        record[attrName] = [ele._content];
      }
    } else {
      record[attrName] = ele._content;
    }
  });
}

function getUserType(item: Record<string, string>): string {
  if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
  if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
  if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
  if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
  return 'Normal';
}

function processAccountItem(
  item: DirectoryItem,
  statusColor: Record<string, { color: string; label: string }>,
): TRow {
  const acc = item as Record<string, unknown>;
  processAttributes(item.a, acc, 'mail');
  return {
    id: item.id ?? '',
    columns: [
      <ds-text as="span" size="small" key={item.id} color="gray0" weight="regular">
        {item.name || ' '}
      </ds-text>,
      <ds-text as="span" size="small" key={item.id} color="gray0" weight="light">
        {(acc.displayName as string) || <>&nbsp;</>}
      </ds-text>,
      <>
        {Array.isArray(acc.mail) && (acc.mail as Array<string>).length - 1 > 0 ? (
          <Tooltip
            key={item.id}
            placement="bottom"
            label={(acc.mail as Array<string>).slice(1).join(', ')}
            maxWidth="auto"
          >
            <ds-text as="span" size="small" weight="light" key={item.id} color="#828282">
              {(acc.mail as Array<string>).length - 1}
            </ds-text>
          </Tooltip>
        ) : (
          <ds-text as="span" size="small" key={item.id} color="#828282" weight="light">
            0
          </ds-text>
        )}
      </>,
      <ds-text as="span" size="small" key={item.id} color="gray0" weight="light">
        {getUserType(acc as Record<string, string>)}
      </ds-text>,
      <ds-text
        as="span"
        size="small"
        weight="light"
        key={item.id}
        color={statusColor[acc.zimbraAccountStatus as string]?.color}
      >
        {statusColor[acc.zimbraAccountStatus as string]?.label}
      </ds-text>,
      <ds-text as="span" size="small" weight="light" key={item.id} color="gray0">
        {(acc.description as string) || <>&nbsp;</>}
      </ds-text>,
    ],
    clickable: true,
  };
}

function processDomainItem(
  item: DirectoryItem,
  cosId: string | undefined,
  defaultCosLabel: string,
): TRow {
  const domainItem = item as Record<string, unknown>;
  processAttributes(item.a, domainItem, 'zimbraDomainCOSMaxAccounts');
  const cosMaxAccounts = domainItem.zimbraDomainCOSMaxAccounts;
  const maxAccountValue = Array.isArray(cosMaxAccounts)
    ? (cosMaxAccounts as Array<string>).find((acc) => acc?.split(':')[0] === cosId)?.split(':')[1]
    : undefined;
  return {
    id: item.id ?? '',
    columns: [
      <ds-text as="span" size="small" key={item.id} color="gray0" weight="regular">
        {item.name || ' '}
      </ds-text>,
      <ds-text as="span" size="small" key={item.id} color="gray0" weight="light">
        {maxAccountValue || ' '}
      </ds-text>,
      <Container key={item.id}>
        {cosId === (domainItem.zimbraDomainDefaultCOSId as string) && (
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
  accounts: Array<DirectoryItem> | undefined,
  statusColor: Record<string, { color: string; label: string }>,
): Array<TRow> {
  if (!accounts?.length) return [];
  return accounts.map((item) => processAccountItem(item, statusColor));
}

function buildDomainList(
  domains: Array<DirectoryItem> | undefined,
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
  const createSnackbar = useSnackbar();
  const modifyCosMutation = useModifyCos(cosId);
  const { data: totalAccount = 0 } = useTotalAccounts(cosId);
  const { data: totalDomain = 0 } = useTotalDomains(cosId);

  const [openDeleteCOSConfirmDialog, setOpenDeleteCOSConfirmDialog] = useState<boolean>(false);

  const [offset, setOffset] = useState<number>(0);
  const [accountLimit, setAccountLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [searchAccountString, setSearchAccountString] = useState<string>('');
  const debouncedAccountSearch = useDebouncedValue(searchAccountString, 700);

  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [searchDomainString, setSearchDomainString] = useState<string>('');
  const [domainOffset, setDomainOffset] = useState<number>(0);
  const debouncedDomainSearch = useDebouncedValue(searchDomainString, 700);

  const STATUS_COLOR: Record<string, { color: string; label: string }> = {
    active: { color: '#8BC34A', label: t('label.active', 'Active') },
    maintenance: { color: '#2196D3', label: t('label.in_maintenance', 'In maintenance') },
    locked: { color: '#D74942', label: t('label.locked', 'Locked') },
    closed: { color: '#828282', label: t('label.closed', 'Closed') },
    pending: { color: '#828282', label: t('label.pending', 'Pending') },
    lockout: { color: '#D74942', label: t('label.lockout', 'Lockout') },
  };

  const {
    data: accountsData,
    isPending: isAccountRequestInProgress,
    isFetching: isAccountFetching,
    isPlaceholderData: isAccountPlaceholderData,
  } = useCosAccounts(cosId, debouncedAccountSearch, offset, accountLimit);

  const accountList = buildAccountList(
    accountsData?.accounts as Array<DirectoryItem>,
    STATUS_COLOR,
  );

  const totalAccounts = accountsData?.total ?? 0;

  const {
    data: domainsData,
    isPending: isDomainRequestInProgress,
    isFetching: isDomainFetching,
    isPlaceholderData: isDomainPlaceholderData,
  } = useCosDomains(cosId, debouncedDomainSearch, domainOffset, limit);

  const domainList = buildDomainList(
    domainsData?.domains as Array<DirectoryItem>,
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
        try {
          await renameCos(renameBody);
          modifyCosMutation.mutate(body, {
            onSuccess: () => {
              form.reset(value, { keepDefaultValues: true });
            },
          });
        } catch (error) {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label:
              (error as Error)?.message ||
              t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        }
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
        <Row mainAlignment="flex-start" width="100%">
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <form.Field name="cn">
                  {(field) => (
                    <Input
                      isRequired
                      label={t('label.name', 'Name')}
                      backgroundColor={canDeleteCOS ? 'gray6' : 'gray5'}
                      value={field.state.value}
                      onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                        field.handleChange(e.target.value);
                      }}
                      disabled={canDeleteCOS || readonlyCOS}
                    />
                  )}
                </form.Field>
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <Input
                  label={t('label.id_lbl', 'ID')}
                  backgroundColor="gray6"
                  value={cosData.zimbraId}
                  disabled
                  onChange={(): void => {}}
                />
              </Container>
              <Container padding={{ all: 'small' }}>
                <Input
                  label={t('label.creation_date', 'Creation Date')}
                  value={cosCreationDate}
                  backgroundColor="gray6"
                  disabled
                  onChange={(): void => {}}
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
                <form.Field name="description">
                  {(field) => (
                    <Input
                      label={t('label.description', 'Description')}
                      backgroundColor="gray5"
                      value={field.state.value}
                      onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                        field.handleChange(e.target.value);
                      }}
                      disabled={readonlyCOS}
                    />
                  )}
                </form.Field>
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <form.Field name="zimbraNotes">
                  {(field) => (
                    <CustomTextArea
                      label={t('label.notes', 'Notes')}
                      backgroundColor="gray5"
                      value={field.state.value}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => {
                        field.handleChange(e.target.value);
                      }}
                      disabled={readonlyCOS}
                    />
                  )}
                </form.Field>
              </Container>
            </ListRow>
          </Container>
        </Row>
        <SearchableTable
          title={t('cos.domains_that_use_this_cos', 'Domains that use this COS')}
          searchLabel={t('label.search_for_a_domain', 'Search for a domain')}
          searchValue={searchDomainString}
          onSearchChange={setSearchDomainString}
          rows={domainList}
          headers={domainHeaders}
          totalItems={totalDomains}
          pageSize={limit}
          onOffsetChange={setDomainOffset}
          onPageSizeChange={setLimit}
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
          pageSize={accountLimit}
          onOffsetChange={setOffset}
          onPageSizeChange={setAccountLimit}
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
