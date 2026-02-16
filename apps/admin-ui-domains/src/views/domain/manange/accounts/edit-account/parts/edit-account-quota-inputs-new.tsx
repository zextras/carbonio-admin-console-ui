/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import { Input, Row } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

type EditAccountQuotaInputsNewProps = {};

export const EditAccountQuotaInputsNew = (): React.JSX.Element | null => {

  const isAdvanced = useIsAdvanced();
  const [t] = useTranslation();

  if (!isAdvanced) {
    return null;
  } else {
    return (<Row
      width="100%"
      padding={{ top: 'large', left: 'large' }}
      mainAlignment="space-between"
      crossAlignment="flex-start"
    >
    <Input
      label={t('label.total_quota_limit_gb', 'Total quota(GB)')}
      background={'gray5'}
      inputName="totalQuota"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = e.target.value.replace(/\D/g, '');
      }}
    />
    </Row>);
  }
}