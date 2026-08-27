/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { ChipInput, InheritedSwitch, Row } from '@zextras/ui-components';
import { map, some } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import CustomChip from '../../components/customChip';
import { isValidEmail } from '../../utility/utils';
import {
  useAccountForm,
  useSetAccountValues,
  useToggleAccountValue,
} from '../account-form-context';
import { SignatureDetail } from '../signature-detail/signature-detail';
import { chipsToValue, useChipList } from '../use-chip-list';

export const SendingOptions = () => {
  const [t] = useTranslation();
  const { form, cosDetail, accSpecificDetail, signatureList } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const accountDetail = useSelector(form.store, (s) => s.values as Record<string, any>);
  const [zimbraAllowFromAddress, setZimbraAllowFromAddress] = useChipList(
    accountDetail?.zimbraAllowFromAddress,
  );

  const setEmptyValue = (keyName: string) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  return (
    <>
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.sending_mails', 'Sending Mails')}
          </ds-text>
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
        <Row width="100%" mainAlignment="flex-start">
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefSaveToSent}
            onChange={toggleAccountValue}
            label={t('account_details.save_to_sent', 'Save to sent')}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefSaveToSent}
            fromSubValue={accSpecificDetail?.zimbraPrefSaveToSent}
            inputName={'zimbraPrefSaveToSent'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefSaveToSent')}
          />
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="100%" mainAlignment="flex-start">
          <ChipInput
            placeholder={t('label.allowed_sending_addresses', 'Allowed sending Addresses')}
            background="gray5"
            onChange={(contacts: any): void => {
              const data: any = [];
              map(contacts, (contact) => {
                if (isValidEmail(contact.label ?? '')) data.push(contact);
              });
              setZimbraAllowFromAddress(data);
              setAccountValues((prev: Record<string, any>) => ({
                ...prev,
                zimbraAllowFromAddress: chipsToValue(data),
              }));
            }}
            value={zimbraAllowFromAddress}
            hasError={some(zimbraAllowFromAddress || [], { error: true })}
            ChipComponent={CustomChip}
            maxChips={null}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
        <Row width="100%" mainAlignment="flex-start">
          <InheritedSwitch
            subValue={accountDetail?.zimbraFeatureReadReceiptsEnabled}
            onChange={toggleAccountValue}
            label={t(
              'domain.accounts.editAccount.allowTheUserToAskForAReadReceipt',
              `Allow the user to ask for a read receipt`,
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraFeatureReadReceiptsEnabled}
            fromSubValue={accSpecificDetail?.zimbraFeatureReadReceiptsEnabled}
            inputName={'zimbraFeatureReadReceiptsEnabled'}
            onChangeReset={(): void => setEmptyValue('zimbraFeatureReadReceiptsEnabled')}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.composing_mails', 'Composing Mails')}
          </ds-text>
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefMailSignatureEnabled}
            onChange={toggleAccountValue}
            label={t('account_details.mail_signature', 'Mail Signature')}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefMailSignatureEnabled}
            fromSubValue={accSpecificDetail?.zimbraPrefMailSignatureEnabled}
            inputName={'zimbraPrefMailSignatureEnabled'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefMailSignatureEnabled')}
          />
        </Row>
      </Row>
      <SignatureDetail
        isEditable
        signatureList={signatureList}
        accountId={accountDetail?.zimbraId}
      />
    </>
  );
};
