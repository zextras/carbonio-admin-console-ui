/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, DropDownInput, Row, Select, useSnackbar } from '@zextras/ui-components';
import { debounce } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { accountListDirectory } from '../../../../services/account-list-directory-service';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { delegateType } from '../../../utility/utils';
import { useAccountForm } from '../account-form-context';

const DelegateSelectModeSection: FC = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [delegateAccountList, setDelegateAccountList] = useState<any[]>([]);
  const [searchDelegateAccountName, setSearchDelegateAccountName] = useState(undefined);
  const [isDelegateAccountListExpand, setIsDelegateAccountListExpand] = useState(false);
  const DELEGETES_TYPE = useMemo(() => delegateType(t), [t]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const offset = 0;
  const limit = 20;
  const { form, deligateDetail, setDeligateDetail } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const accountDetail = values;

  const searchAccountList = useCallback(
    debounce((searchText, type) => {
      if (searchText) {
        if (type === 'distributionlists') {
          setSearchQuery(`(&(objectClass=zimbraDistributionList)(mail=*${searchText}*))`);
        } else {
          setSearchQuery(
            `(&(objectClass=zimbraAccount)(zimbraMailDeliveryAddress=*${searchText}*))`,
          );
        }
      } else {
        setSearchQuery('');
      }
    }, 700),
    [debounce],
  );

  useEffect(() => {
    const type = deligateDetail?.grantee?.[0]?.type === 'grp' ? 'distributionlists' : 'accounts';
    searchAccountList(searchDelegateAccountName, type);
  }, [searchAccountList, searchDelegateAccountName, deligateDetail]);

  const selectedDelegateAccount = useCallback(
    (v: any): void => {
      setSearchDelegateAccountName(v.name);
      setDeligateDetail((prev: any) => ({
        ...prev,
        grantee: [{ name: v.name, type: deligateDetail?.grantee?.[0]?.type || '' }],
      }));
    },
    [deligateDetail, setDeligateDetail],
  );

  const getAccountList = useCallback((): void => {
    const type = deligateDetail?.grantee?.[0]?.type === 'grp' ? 'distributionlists' : 'accounts';
    const attrs =
      'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
    accountListDirectory(attrs, type, '', searchQuery, offset, limit)
      .then((data) => {
        const accountListResponse: any = data?.account || [];

        if (accountListResponse && Array.isArray(accountListResponse)) {
          const accountListArr: any[] = [];
          if (data?.dl?.length) {
            data.account = data?.dl;
          }
          data?.account.map(
            (delegateAccount: any) =>
              delegateAccount.id !== accountDetail.zimbraId &&
              accountListArr.push({
                id: delegateAccount.id,
                label: delegateAccount.name,
                customComponent: (
                  <Row
                    style={{
                      display: 'block',
                      textAlign: 'left',
                      height: 'inherit',
                      width: 'inherit',
                    }}
                    onClick={(): void => {
                      selectedDelegateAccount(delegateAccount);
                    }}
                  >
                    {delegateAccount?.name}
                  </Row>
                ),
              }),
          );
          setDelegateAccountList(accountListArr);
        }
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
      });
  }, [
    deligateDetail?.grantee,
    searchQuery,
    offset,
    limit,
    accountDetail.zimbraId,
    selectedDelegateAccount,
    t,
    createSnackbar,
  ]);

  useEffect(() => {
    if (searchQuery.length > 2) getAccountList();
  }, [getAccountList, searchQuery]);

  const onGroupByChange = (v: any): any => {
    setDeligateDetail((prev: any) => ({
      ...prev,
      grantee: [{ type: v, name: deligateDetail?.grantee?.[0]?.name || '' }],
    }));
    setSearchDelegateAccountName(undefined);
    if (searchQuery.length > 2) getAccountList();
  };

  const customIconDetail = {
    icon: 'GlobeOutline' as const,
    color: 'text',
    onClick: (): void => {
      setIsDelegateAccountListExpand(!isDelegateAccountListExpand);
    },
    style: {
      width: '20px',
      height: '20px',
    },
  };
  return (
    <>
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
            <Select
              background="gray5"
              label={t('account_details.who_will_be_delegates', 'Who will be the delegates?')}
              showCheckbox={false}
              defaultSelection={DELEGETES_TYPE.find(
                (item: any) => item.value === deligateDetail?.grantee?.[0]?.type,
              )}
              onChange={onGroupByChange}
              items={DELEGETES_TYPE}
            />
          </Row>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="100%" mainAlignment="flex-start">
            <DropDownInput
              items={delegateAccountList}
              maxWidth="19rem"
              width="17rem"
              inputLabel={t(
                'account_details.search_here_for_an_account',
                'Search here for an Account',
              )}
              onChange={(ev: any): void => {
                setSearchDelegateAccountName(ev.target.value);
              }}
              inputValue={
                searchDelegateAccountName === undefined
                  ? deligateDetail?.grantee?.[0]?.name || ''
                  : searchDelegateAccountName
              }
              isCustomIcon
              customIconDetail={customIconDetail}
            />
          </Row>
        </Row>
      </Container>
    </>
  );
};

export default DelegateSelectModeSection;
