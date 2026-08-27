/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Container, Row, Switch } from '@zextras/ui-components';
import { useIsAdvanced, useUserSettings } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { TRUE } from '../../constants';
import { useAccountMembership } from '../../services/use-account-membership';
import { useAccountForm, useSetAccountValues, useToggleAccountValue } from './account-form-context';
import {
	AdminRightsSection,
	filterAdminGroups,
} from './administration-section/admin-rights-section';

type EditAccountAdministrationSectionProps = {
  onLoadingChange: (isLoading: boolean) => void;
};

export const EditAccountAdministrationSection = ({
  onLoadingChange,
}: EditAccountAdministrationSectionProps) => {
  const { form, account, savedValues } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const accountDetail = values;
  const initAccountDetail = savedValues as Record<string, any>;

  const { data: membershipDl = [] } = useAccountMembership(account.id);
  const adminGroups = filterAdminGroups(membershipDl);

  const isAdvanced = useIsAdvanced();
  const userSetting = useUserSettings();
  const [t] = useTranslation();

  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

  const showDelegatedRights =
    isAdvanced &&
    accountDetail?.zimbraIsAdminAccount !== 'TRUE' &&
    accountDetail?.zimbraIsDelegatedAdminAccount === 'TRUE';

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
                    form.setFieldValue('deleteAdministrationRights', adminGroups);
                  } else {
                    form.setFieldValue('deleteAdministrationRights', []);
                  }
                  toggleAccountValue('zimbraIsAdminAccount');
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
                  onClick={(): void => toggleAccountValue('zimbraIsDelegatedAdminAccount')}
                  label={t('account_details.delegated_administration', 'Delegated administration')}
                  iconColor="primary"
                />
              )}
            </Row>
          </Row>
        )}
        {showDelegatedRights && (
          <AdminRightsSection
            accountId={account.id}
            accountName={accountDetail?.name}
            adminGroups={adminGroups}
            onLoadingChange={onLoadingChange}
          />
        )}
      </Row>
    </Container>
  );
};
