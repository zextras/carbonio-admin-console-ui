/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  ComboboxInput,
  type ComboboxItem,
  Container,
  PlainSelect,
  Row,
} from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAccountListDirectory } from '../../../services/use-account-list-directory';
import { delegateType } from '../../utility/utils';
import { useAccountForm } from '../account-form-context';

const DELEGATE_SEARCH_ATTRS =
  'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';

type DelegateAccount = { id: string; name: string };

/** LDAP filter for the delegate search over accounts or distribution lists. */
export function buildDelegateSearchQuery(search: string, type: string): string {
  if (!search) {
    return '';
  }
  return type === 'distributionlists'
    ? `(&(objectClass=zimbraDistributionList)(mail=*${search}*))`
    : `(&(objectClass=zimbraAccount)(zimbraMailDeliveryAddress=*${search}*))`;
}

/** Dropdown items for the delegate search; the edited account is excluded. */
export function buildDelegateAccountItems(
  list: Array<DelegateAccount>,
  selfId: string | undefined,
): Array<ComboboxItem> {
  return list
    .filter((entry) => entry.id !== selfId)
    .map((entry) => ({
      id: entry.id,
      label: entry.name,
    }));
}

export const DelegateSelectModeSection = () => {
  const [t] = useTranslation();
  const [searchDelegateAccountName, setSearchDelegateAccountName] = useState<string | undefined>(
    undefined,
  );
  const DELEGETES_TYPE = delegateType(t);
  const { form, deligateDetail, setDeligateDetail } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const accountDetail = values;

  const searchType =
    deligateDetail?.grantee?.[0]?.type === 'grp' ? 'distributionlists' : 'accounts';
  const debouncedSearch = useDebouncedValue(searchDelegateAccountName, 700);
  const searchQuery = buildDelegateSearchQuery(debouncedSearch ?? '', searchType);

  const { data: delegateAccounts = [], isFetching } = useAccountListDirectory(
    {
      attr: DELEGATE_SEARCH_ATTRS,
      type: searchType,
      domainName: '',
      query: searchQuery,
      offset: 0,
      limit: 20,
    },
    searchQuery.length > 2,
  );

  const selectedDelegateAccount = (v: DelegateAccount): void => {
    setSearchDelegateAccountName(v.name);
    setDeligateDetail((prev: any) => ({
      ...prev,
      grantee: [{ name: v.name, type: deligateDetail?.grantee?.[0]?.type || '' }],
    }));
  };

  const delegateAccountList = buildDelegateAccountItems(delegateAccounts, accountDetail.zimbraId);

  const onGroupByChange = (v: any): any => {
    setDeligateDetail((prev: any) => ({
      ...prev,
      grantee: [{ type: v, name: deligateDetail?.grantee?.[0]?.name || '' }],
    }));
    setSearchDelegateAccountName(undefined);
  };
  return (
    <Container
      mainAlignment="flex-start"
      padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
    >
      <Row mainAlignment="flex-start" width="100%">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h3">
            {t('account_details.i_want_to_create_a_delegate_for', `I want to create a delegate`)}
          </ds-text>
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="100%" mainAlignment="flex-start">
          <PlainSelect
            label={t('account_details.who_will_be_delegates', 'Who will be the delegates?')}
            items={DELEGETES_TYPE}
						selection={
							DELEGETES_TYPE.find(
								(item: { value: string; label: string }) =>
									item.value === deligateDetail?.grantee?.[0]?.type,
							) ?? { label: '', value: '' }
						}
            onChange={onGroupByChange}
          />
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="100%" mainAlignment="flex-start">
          <ComboboxInput
            items={delegateAccountList}
            label={t('account_details.search_here_for_an_account', 'Search here for an Account')}
            onChange={(ev: any): void => {
              setSearchDelegateAccountName(ev.target.value);
            }}
            value={searchDelegateAccountName ?? deligateDetail?.grantee?.[0]?.name ?? ''}
						onSelect={(item: ComboboxItem): void => {
							const entry = delegateAccounts.find(
								(account: DelegateAccount) => account.id === item.id,
							);
							if (entry) selectedDelegateAccount(entry);
						}}
            loading={isFetching}
          />
        </Row>
      </Row>
    </Container>
  );
};
