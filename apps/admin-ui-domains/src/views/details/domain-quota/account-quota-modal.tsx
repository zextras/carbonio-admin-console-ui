/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { Button, InheritedSelect, Modal, useSnackbar } from '@zextras/ui-components';
import { useCosList, useCosQuota, useUserSettings } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TRUE } from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import type { ComputedLimit, GetAccountQuotaResponse } from '../../../services/account-quota';
import { domainQueryKeys } from '../../../services/domain-query-keys';
import { useAccountQuota } from '../../../services/use-account-quota';
import { useAssignableCosList } from '../../../services/use-assignable-cos-list';
import { useDomainQuota } from '../../../services/use-domain-quota';
import { useModifyAccountAttributes } from '../../../services/use-modify-account-attributes';
import { useSetAccountQuota } from '../../../services/use-set-account-quota';
import { QuotaLimitInput } from '../../edit-account/parts/edit-account-quota-inputs';
import {
  computedLimitToLimit,
  quotaExceedsDomainLimit,
  quotaValueFromLimit,
} from '../../edit-account/parts/quota-utils';
import { TotalQuotaSourceIcon } from '../../edit-account/parts/total-quota-source-icon';
import { getInheritedCosId } from './domain-quota-rows';

type CosEntry = { id: string; name: string };

type AccountQuotaSuccess = Extract<GetAccountQuotaResponse, { type: 'success' }>;

type DomainQuotaConstraint = number | 'not-set';

export type QuotaModalAccount = {
  id: string;
  email: string;
  /** `zimbraCOSId` of the account, empty when the account has no explicit COS. */
  cosId: string;
};

type AccountQuotaModalProps = {
  account: QuotaModalAccount;
  domainName: string;
  onClose: () => void;
};

type AccountQuotaModalFormProps = AccountQuotaModalProps & {
  cosList: Array<CosEntry>;
  assignableCoses: Array<CosEntry>;
  /** COS the accounts without an explicit COS belong to. */
  inheritedCosId: string;
  /** Quota of the account, only loaded for global admins. */
  accountQuota: AccountQuotaSuccess | undefined;
  domainQuotaConstraint: DomainQuotaConstraint;
  isGlobalAdmin: boolean;
};

function isSameLimit(a: ComputedLimit | undefined, b: ComputedLimit | undefined): boolean {
  if (a === undefined || b === undefined) {
    return a === b;
  }
  if (a.type === 'unlimited' || b.type === 'unlimited') {
    return a.type === b.type;
  }
  return a.value === b.value;
}

const AccountQuotaModalForm = ({
  account,
  domainName,
  onClose,
  cosList,
  assignableCoses,
  inheritedCosId,
  accountQuota,
  domainQuotaConstraint,
  isGlobalAdmin,
}: AccountQuotaModalFormProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const modifyAccount = useModifyAccountAttributes();
  const setAccountQuota = useSetAccountQuota();

  const initialQuotaLimit = accountQuota?.totalComputedLimit;
  const [cosId, setCosId] = useState(account.cosId);
  const [quotaLimit, setQuotaLimit] = useState<ComputedLimit | undefined>(initialQuotaLimit);
  const [isSaving, setIsSaving] = useState(false);

  const effectiveCosId = cosId || inheritedCosId;
  const { data: cosQuota } = useCosQuota(effectiveCosId, isGlobalAdmin);

  const assignedCos = cosList.find((cos) => cos.id === effectiveCosId);
  const inheritedCos = cosList.find((cos) => cos.id === inheritedCosId);
  const cosItems = [
    ...assignableCoses,
    ...[assignedCos, inheritedCos].filter(
      (cos): cos is CosEntry => cos !== undefined && !assignableCoses.some((c) => c.id === cos.id),
    ),
  ]
    .filter((cos, index, all) => all.findIndex((c) => c.id === cos.id) === index)
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map((cos) => ({ label: cos.name, value: cos.id }));

  const cosChanged = cosId !== account.cosId;
  const quotaChanged = isGlobalAdmin && !isSameLimit(quotaLimit, initialQuotaLimit);
  const exceedsDomainLimit = quotaExceedsDomainLimit(
    quotaValueFromLimit(computedLimitToLimit(quotaLimit)),
    domainQuotaConstraint,
  );

  const showError = (label: string): void => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label,
      autoHideTimeout: 5000,
      hideButton: true,
      replace: true,
    });
  };

  const onSave = async (): Promise<void> => {
    setIsSaving(true);
    let cosSaved = false;
    try {
      if (cosChanged) {
        await modifyAccount.mutateAsync({ id: account.id, modifiedData: { zimbraCOSId: cosId } });
        cosSaved = true;
      }
      if (quotaChanged) {
        await setAccountQuota.mutateAsync({ accountId: account.id, limit: quotaLimit });
      }
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.account_quota_updated', 'The account has been correctly updated.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');
      showError(
        cosSaved
          ? t(
              'label.account_cos_updated_quota_failed',
              'The COS has been updated but the quota change failed: {{message}}',
              { message },
            )
          : message,
      );
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.quotaReport(domainName) }),
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.accountListDirectory.base() }),
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.accountCount.base() }),
      // changing the COS can change the account limit even if the quota was not edited
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.accountQuota(account.id) }),
    ]);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal
      hideDividers
      open
      size="medium"
      title={account.email}
      onClose={onClose}
      customFooter={
        <div className="flex justify-end gap-4">
          <Button
            label={t('label.cancel', 'Cancel')}
            color="secondary"
            onClick={onClose}
            disabled={isSaving}
          />
          <Button
            label={t('label.save', 'Save')}
            color="primary"
            onClick={onSave}
            disabled={isSaving || exceedsDomainLimit || !(cosChanged || quotaChanged)}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-sm">
          <ds-text as="h3" size="small" weight="bold" color="gray0">
            {t('label.class_of_service', 'Class of Service')}
          </ds-text>
          <div className="flex items-center gap-sm">
            <div className="grow">
              <InheritedSelect
                label={t('label.class_of_service', 'Class of Service')}
                items={cosItems}
                selectName="zimbraCOSId"
                subValue={cosId}
                inheritedValue={inheritedCosId}
                fromSubValue={!!cosId}
                onChange={(value: string) => setCosId(value)}
                onChangeReset={() => setCosId('')}
              />
            </div>
            {!cosId && <TotalQuotaSourceIcon source="cos" />}
          </div>
        </div>
        {isGlobalAdmin && (
          <>
            <ds-divider></ds-divider>
            <div className="flex flex-col gap-sm">
              <ds-text as="h3" size="small" weight="bold" color="gray0">
                {t('label.quota_section', 'Quota')}
              </ds-text>
              <QuotaLimitInput
                flush
                cosComputedLimit={computedLimitToLimit(cosQuota?.totalComputedLimit)}
                totalComputedQuotaLimit={computedLimitToLimit(quotaLimit)}
                initialTotalComputedQuotaLimit={computedLimitToLimit(initialQuotaLimit)}
                totalQuotaSource={accountQuota?.totalLimitSource}
                onChange={setQuotaLimit}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export const AccountQuotaModal = ({ account, domainName, onClose }: AccountQuotaModalProps) => {
  const userSetting = useUserSettings();
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;
  const { data: domain } = useSelectedDomain();
  const { data: cosData } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const cosList = cosData?.cos;
  const assignableCoses = useAssignableCosList(cosList);
  const { data: accountQuota } = useAccountQuota(account.id, isGlobalAdmin);
  const { data: domainQuota } = useDomainQuota(domain?.id, isGlobalAdmin);

  const isReady =
    cosList &&
    assignableCoses &&
    (!isGlobalAdmin || (accountQuota?.type === 'success' && domainQuota));

  if (!isReady) {
    return (
      <Modal open size="medium" hideFooter hideDividers title={account.email} onClose={onClose}>
        <ds-spinner></ds-spinner>
      </Modal>
    );
  }

  return (
    <AccountQuotaModalForm
      account={account}
      domainName={domainName}
      onClose={onClose}
      cosList={cosList}
      assignableCoses={assignableCoses}
      inheritedCosId={getInheritedCosId(domain?.a, cosList) ?? ''}
      accountQuota={accountQuota}
      domainQuotaConstraint={domainQuota?.type === 'success' ? domainQuota.limit : 'not-set'}
      isGlobalAdmin={isGlobalAdmin}
    />
  );
};
