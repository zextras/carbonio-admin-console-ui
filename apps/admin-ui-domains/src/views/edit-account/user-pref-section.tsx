/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  ChipInput,
  Container,
  InheritedInput,
  InheritedSelect,
  InheritedSwitch,
  Row,
} from '@zextras/ui-components';
import { map, some } from 'lodash-es';
import { ChangeEvent, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CustomChip from '../components/customChip';
import {
  charactorSet,
  conversationGroupBy,
  isValidEmail,
} from '../utility/utils';
import { useAccountForm, useSetAccountValues, useToggleAccountValue } from './account-form-context';
import { SignatureDetail } from './signature-detail/signature-detail';
import { chipsToValue, useChipList } from './use-chip-list';
import { CalendarOptionsSection } from './user-pref-section/calendar-options';

const EditAccountUserPreferencesSection: FC = () => {
  const [t] = useTranslation();
  const { form, cosDetail, accSpecificDetail, signatureList } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const accountDetail = values;
  const [zimbraAllowFromAddress, setZimbraAllowFromAddress] = useChipList(
    accountDetail?.zimbraAllowFromAddress,
  );
  const [outOfOfficeCacheDurationNum, setOutOfOfficeCacheDurationNum] = useState<string>(
    values?.zimbraPrefOutOfOfficeCacheDuration?.slice(0, -1),
  );

  const GROUP_BY = conversationGroupBy(t);
  const CHARACTOR_SET = charactorSet();
  const outOfOfficeCacheDurationType = values?.zimbraPrefOutOfOfficeCacheDuration?.slice(-1) ?? '';
  const POLLING_INTERVAL = [
    {
      label: t('account_details.manuallly', 'Manually'),
      value: '31536000',
    },
    {
      label: t('account_details.as_new_email_arrives', 'As new e-mail arrives'),
      value: '500',
    },

    { label: `2 ${t('label.minutes', 'minutes')}`, value: '2m' },
    { label: `3 ${t('label.minutes', 'minutes')}`, value: '3m' },
    { label: `4 ${t('label.minutes', 'minutes')}`, value: '4m' },
    { label: `5 ${t('label.minutes', 'minutes')}`, value: '5m' },
    { label: `6 ${t('label.minutes', 'minutes')}`, value: '6m' },
    { label: `7 ${t('label.minutes', 'minutes')}`, value: '7m' },
    { label: `8 ${t('label.minutes', 'minutes')}`, value: '8m' },
    { label: `9 ${t('label.minutes', 'minutes')}`, value: '9m' },
    { label: `10 ${t('label.minutes', 'minutes')}`, value: '10m' },
    { label: `15 ${t('label.minutes', 'minutes')}`, value: '15m' },
  ];
  const TIME_TYPES = [
    { label: `${t('label.days', 'Days')}`, value: 'd' },
    { label: `${t('label.hours', 'Hours')}`, value: 'h' },
    { label: `${t('label.minutes', 'Minutes')}`, value: 'm' },
    { label: `${t('label.seconds', 'Seconds')}`, value: 's' },
  ];

  const SEND_READ_RECEIPTS = [
    { label: t('label.never_send_read_receipt', 'Never send a read receipt'), value: 'never' },
    { label: t('label.always_send_read_receipt', 'Always send a read receipt'), value: 'always' },
    { label: t('label.ask_me', 'Ask me'), value: 'prompt' },
  ];


  const changeOutOfOfficeDurationetail = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefOutOfOfficeCacheDuration: `${e.target.value}${outOfOfficeCacheDurationType}`,
    }));
    setOutOfOfficeCacheDurationNum(e.target.value);
  };
  const onOutOfOfficeCacheDurationTypeChange = (v: string) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefOutOfOfficeCacheDuration: `${outOfOfficeCacheDurationNum}${v}`,
    }));
  };
  const onGroupByChange = (v: string): void => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, zimbraPrefGroupMailBy: v }));
  };
  const onCharactorSetChange = (v: string): void => {
    if (v)
      setAccountValues((prev: Record<string, any>) => ({
        ...prev,
        zimbraPrefMailDefaultCharset: v,
      }));
  };
  const onPollingIntervalChange = (v: string): void => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefMailPollingInterval: v,
    }));
  };
  const onReadReceiptChange = (v: string): void => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefMailSendReadReceipts: v,
    }));
  };

  const setEmptyValue = (keyName: string) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  return (
    <Container
      mainAlignment="flex-start"
      padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
      style={{ overflow: 'auto' }}
    >
      <Row mainAlignment="flex-start" width="100%">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.mailing_options', 'Mail Options')}
          </ds-text>
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefMessageViewHtmlPreferred}
            onChange={toggleAccountValue}
            label={t('account_details.view_mail_as_html', 'View mail as HTML')}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefMessageViewHtmlPreferred}
            fromSubValue={accSpecificDetail?.zimbraPrefMessageViewHtmlPreferred}
            inputName={'zimbraPrefMessageViewHtmlPreferred'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefMessageViewHtmlPreferred')}
          />
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSelect
            label={t('label.group_by', 'Group by')}
            items={GROUP_BY}
            subValue={accountDetail.zimbraPrefGroupMailBy}
            inheritedValue={cosDetail.zimbraPrefGroupMailBy}
            fromSubValue={accSpecificDetail?.zimbraPrefGroupMailBy}
            background="gray5"
            selectName="zimbraPrefGroupMailBy"
            onChange={onGroupByChange}
            onChangeReset={(): void => setEmptyValue('zimbraPrefGroupMailBy')}
          />
        </Row>
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSelect
            label={t('label.default_charset', 'Default Charset')}
            items={CHARACTOR_SET}
            subValue={accountDetail.zimbraPrefMailDefaultCharset}
            inheritedValue={cosDetail.zimbraPrefMailDefaultCharset}
            fromSubValue={accSpecificDetail?.zimbraPrefMailDefaultCharset}
            background="gray5"
            selectName="zimbraPrefMailDefaultCharset"
            onChange={onCharactorSetChange}
            onChangeReset={(): void => setEmptyValue('zimbraPrefMailDefaultCharset')}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefMessageIdDedupingEnabled}
            onChange={toggleAccountValue}
            label={t(
              'account_details.auto_delete_duplicate_messages',
              'Auto-Delete duplicate messages',
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefMessageIdDedupingEnabled}
            fromSubValue={accSpecificDetail?.zimbraPrefMessageIdDedupingEnabled}
            inputName={'zimbraPrefMessageIdDedupingEnabled'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefMessageIdDedupingEnabled')}
          />
        </Row>
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefMailToasterEnabled}
            onChange={toggleAccountValue}
            label={t(
              'account_details.enable_new_mail_toast_notification',
              `Enable New Mail Toast Notification`,
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefMailToasterEnabled}
            fromSubValue={accSpecificDetail?.zimbraPrefMailToasterEnabled}
            inputName={'zimbraPrefMailToasterEnabled'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefMailToasterEnabled')}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.receiving_mails', 'Receiving Mails')}
          </ds-text>
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="100%" mainAlignment="flex-start">
          <InheritedSelect
            label={t('label.check_new_mail_every', 'Check new mail every')}
            items={POLLING_INTERVAL}
            subValue={accountDetail.zimbraPrefMailPollingInterval}
            inheritedValue={cosDetail.zimbraPrefMailPollingInterval}
            fromSubValue={accSpecificDetail?.zimbraPrefMailPollingInterval}
            background="gray5"
            selectName="zimbraPrefMailPollingInterval"
            onChange={onPollingIntervalChange}
            onChangeReset={(): void => setEmptyValue('zimbraPrefMailPollingInterval')}
          />
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefOutOfOfficeReplyEnabled}
            onChange={toggleAccountValue}
            label={t(
              'account_details.can_send_auto_reply_messages',
              `Can send auto-reply messages`,
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefOutOfOfficeReplyEnabled}
            fromSubValue={accSpecificDetail?.zimbraPrefOutOfOfficeReplyEnabled}
            inputName={'zimbraPrefOutOfOfficeReplyEnabled'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefOutOfOfficeReplyEnabled')}
          />
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="48%" mainAlignment="flex-start">
          <InheritedInput
            label={t('label.out_of_office_cache_lifetime', 'Out of office cache lifetime')}
            subValue={accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(0, -1) || ''}
            inheritedValue={cosDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(0, -1) || ''}
            fromSubValue={accSpecificDetail?.zimbraPrefOutOfOfficeCacheDuration}
            background="gray5"
            inputName="zimbraPrefOutOfOfficeCacheDuration"
            onChange={changeOutOfOfficeDurationetail}
            onChangeReset={(): void => setEmptyValue('zimbraPrefOutOfOfficeCacheDuration')}
            pref={{ type: 'number' }}
          />
        </Row>
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSelect
            label={t('label.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
            items={TIME_TYPES}
            subValue={accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(-1) || ''}
            inheritedValue={cosDetail.zimbraPrefOutOfOfficeCacheDuration?.slice(-1) || ''}
            fromSubValue={accSpecificDetail?.zimbraPrefOutOfOfficeCacheDuration}
            background="gray5"
            selectName="zimbraPrefOutOfOfficeCacheDuration"
            onChange={onOutOfOfficeCacheDurationTypeChange}
            onChangeReset={(): void => setEmptyValue('zimbraPrefOutOfOfficeCacheDuration')}
          />
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="48%" mainAlignment="flex-start">
          <InheritedSelect
            label={t('label.read_receipt_settings', 'Read Receipt settings')}
            items={SEND_READ_RECEIPTS}
            subValue={accountDetail?.zimbraPrefMailSendReadReceipts}
            inheritedValue={cosDetail.zimbraPrefMailSendReadReceipts}
            fromSubValue={accSpecificDetail?.zimbraPrefMailSendReadReceipts}
            background="gray5"
            selectName="zimbraPrefMailSendReadReceipts"
            onChange={onReadReceiptChange}
            onChangeReset={(): void => setEmptyValue('zimbraPrefMailSendReadReceipts')}
          />
        </Row>
      </Row>
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
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
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
      <CalendarOptionsSection />
    </Container>
  );
};

export default EditAccountUserPreferencesSection;
