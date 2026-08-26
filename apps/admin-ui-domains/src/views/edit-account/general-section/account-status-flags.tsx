/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Row, Switch, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { useAccountForm, useToggleAccountValue } from '../account-form-context';

export const AccountStatusFlags = () => {
  const { form } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const toggleAccountValue = useToggleAccountValue();
  const [t] = useTranslation();

  return (
    <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
      <Row width="27%" mainAlignment="flex-start">
        <Switch
          value={values?.zimbraHideInGal === 'TRUE'}
          onClick={(): void => toggleAccountValue('zimbraHideInGal')}
          label={t('account_details.hidden_in_gal', 'Hidden in GAL')}
          iconColor="primary"
        />
        <Tooltip placement="top" label={t('label.global_address_list', 'Global Address List')}>
          <ds-text
            as="span"
            size="small"
            color="gray0"
            style={{ textDecoration: 'underline', cursor: 'default' }}
          >
            ({t('label.what_is_a_gal', "What's a GAL?")})
          </ds-text>
        </Tooltip>
      </Row>
      <Row width="69%" mainAlignment="flex-start">
        <Switch
          value={values?.zimbraPasswordMustChange === 'TRUE'}
          onClick={(): void => toggleAccountValue('zimbraPasswordMustChange')}
          label={t(
            'account_details.this_user_must_change_password',
            'This user must change password',
          )}
          iconColor="primary"
        />
      </Row>
    </Row>
  );
};
