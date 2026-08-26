/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { InheritedSwitch, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import {
  useAccountForm,
  useSetAccountValues,
  useToggleAccountValue,
} from '../account-form-context';

export const ContactOptions = () => {
  const [t] = useTranslation();
  const { form, cosDetail, accSpecificDetail } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const accountDetail = useSelector(form.store, (s) => s.values as Record<string, any>);

  const setEmptyValue = (keyName: string) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  return (
    <>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.contact_options', 'Contact Options')}
          </ds-text>
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefAutoAddAddressEnabled}
            onChange={toggleAccountValue}
            label={t('account_details.enable_auto_add_contacts', `Enable auto-add contacts`)}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefAutoAddAddressEnabled}
            fromSubValue={accSpecificDetail?.zimbraPrefAutoAddAddressEnabled}
            inputName={'zimbraPrefAutoAddAddressEnabled'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefAutoAddAddressEnabled')}
          />
        </Row>
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefGalAutoCompleteEnabled}
            onChange={toggleAccountValue}
            label={t('account_details.use_gal_to_auto_fill', 'Use GAL to auto-fill')}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefGalAutoCompleteEnabled}
            fromSubValue={accSpecificDetail?.zimbraPrefGalAutoCompleteEnabled}
            inputName={'zimbraPrefGalAutoCompleteEnabled'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefGalAutoCompleteEnabled')}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
    </>
  );
};
