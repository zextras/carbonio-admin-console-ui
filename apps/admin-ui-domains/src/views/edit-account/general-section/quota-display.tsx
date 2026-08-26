/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { LabeledValue, Row, Select } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { ABQStatus, backupEnabledStatus } from '../../utility/utils';
import { useAccountForm, useSetAccountValues } from '../account-form-context';
import { EditAccountQuotaInputs } from '../parts/edit-account-quota-inputs';
import { formatZimbraDateOr } from './utils';

export const QuotaDisplay = () => {
  const { form, cosDetail, savedValues } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();

  const ABQ_STATUS = ABQStatus(t);
  const BACKUP_ENABLED_STATUS = backupEnabledStatus(t);

  const onAccountABQStatusChange = (v: any): any => {
    form.setFieldValue('abqMode', v);
  };
  const onAccountBackupEnabledStatusChange = (v: any): any => {
    form.setFieldValue('backupEnabled', v);
  };

  return (
    <>
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
                ABQ_STATUS.find((item: any) => item.value === values?.abqMode) || ABQ_STATUS[0]
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
                BACKUP_ENABLED_STATUS.find((item: any) => item.value === values?.backupEnabled) ||
                BACKUP_ENABLED_STATUS[0]
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
            value={formatZimbraDateOr(
              values?.zimbraCreateTimestamp,
              t('label.not_available', 'Not Available'),
            )}
          />
        </Row>
        <Row width="49%" mainAlignment="flex-start">
          <LabeledValue
            label={t('label.last_access', 'Last Access')}
            backgroundColor="gray6"
            value={formatZimbraDateOr(
              values?.zimbraLastLogonTimestamp,
              t('label.never_logged_in', 'Never logged in'),
            )}
            defaultValue={t('label.never_logged_in', 'Never logged in')}
          />
        </Row>
      </Row>
    </>
  );
};
