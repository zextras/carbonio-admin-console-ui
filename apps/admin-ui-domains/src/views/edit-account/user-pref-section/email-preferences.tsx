/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { InheritedSwitch, Row,Select, TextInput } from '@zextras/ui-components';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { InheritedPrefSelect } from '../../utility/inherited-pref-select';
import { isInheritedOverridden } from '../../utility/is-inherited-overridden';
import { RevertToInheritedIcon } from '../../utility/revert-to-inherited-icon';
import { charactorSet, conversationGroupBy } from '../../utility/utils';
import {
  useAccountForm,
  useSetAccountValues,
  useToggleAccountValue,
} from '../account-form-context';

export const EmailPreferences = () => {
  const [t] = useTranslation();
  const { form, cosDetail, accSpecificDetail } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const accountDetail = useSelector(form.store, (s) => s.values as Record<string, any>);

  const [outOfOfficeCacheDurationNum, setOutOfOfficeCacheDurationNum] = useState<string>(
    accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(0, -1),
  );

  const GROUP_BY = conversationGroupBy(t);
  const CHARACTOR_SET = charactorSet();
  const outOfOfficeCacheDurationType =
    accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(-1) ?? '';
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

  const cacheDurationLive = accountDetail?.zimbraPrefOutOfOfficeCacheDuration as string | undefined;
  const cacheDurationInherited = cosDetail?.zimbraPrefOutOfOfficeCacheDuration as
    | string
    | undefined;
  const isCacheDurationOverridden = isInheritedOverridden(
    cacheDurationLive,
    accSpecificDetail?.zimbraPrefOutOfOfficeCacheDuration as string | undefined,
    cacheDurationInherited,
  );

  const inheritedDescription = t('label.inherited_from_cos', 'Inherited from the Class of Service');
  const revertLabel = t('label.click_to_revert', 'Click to revert to the inherited value');

  const changeOutOfOfficeDurationetail = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefOutOfOfficeCacheDuration: e.target.value
        ? `${e.target.value}${outOfOfficeCacheDurationType}`
        : '',
    }));
    setOutOfOfficeCacheDurationNum(e.target.value);
  };
  const onOutOfOfficeCacheDurationTypeChange = (v: string) => {
    const num =
      (cacheDurationLive ?? cacheDurationInherited ?? '').slice(0, -1) ||
      outOfOfficeCacheDurationNum ||
      '';
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefOutOfOfficeCacheDuration: num ? `${num}${v}` : '',
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

  const prefSelectProps = {
    values: accountDetail,
    cosDetail,
    accSpecificDetail,
    setEmptyValue,
  };

  return (
    <>
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
          {accountDetail?.zimbraId ? (
            <InheritedPrefSelect
              {...prefSelectProps}
              label={t('label.group_by', 'Group by')}
              selectName="zimbraPrefGroupMailBy"
              items={GROUP_BY}
              onChange={onGroupByChange}
            />
          ) : (
            <></>
          )}
        </Row>
        <Row width="48%" mainAlignment="flex-start">
          {accountDetail?.zimbraId ? (
            <InheritedPrefSelect
              {...prefSelectProps}
              label={t('label.default_charset', 'Default Charset')}
              selectName="zimbraPrefMailDefaultCharset"
              items={CHARACTOR_SET}
              onChange={onCharactorSetChange}
            />
          ) : (
            <></>
          )}
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
          {accountDetail?.zimbraId ? (
            <InheritedPrefSelect
              {...prefSelectProps}
              label={t('label.check_new_mail_every', 'Check new mail every')}
              selectName="zimbraPrefMailPollingInterval"
              items={POLLING_INTERVAL}
              onChange={onPollingIntervalChange}
            />
          ) : (
            <></>
          )}
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
          <TextInput
            label={t('label.out_of_office_cache_lifetime', 'Out of office cache lifetime')}
            name="zimbraPrefOutOfOfficeCacheDuration"
            type="number"
            autoComplete="off"
            value={cacheDurationLive?.slice(0, -1) ?? cacheDurationInherited?.slice(0, -1) ?? ''}
            onChange={changeOutOfOfficeDurationetail}
            description={isCacheDurationOverridden ? undefined : inheritedDescription}
            icon={
              isCacheDurationOverridden ? (
                <RevertToInheritedIcon
                  label={revertLabel}
                  onClick={(): void => setEmptyValue('zimbraPrefOutOfOfficeCacheDuration')}
                />
              ) : undefined
            }
          />
        </Row>
        <Row width="48%" mainAlignment="flex-start">
          {accountDetail?.zimbraId ? (
            <Select
              label={t('label.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
              items={TIME_TYPES}
              selection={
                TIME_TYPES.find((item) => item.value === cacheDurationLive?.slice(-1)) ??
                TIME_TYPES.find((item) => item.value === cacheDurationInherited?.slice(-1)) ??
                TIME_TYPES[0]
              }
              onChange={onOutOfOfficeCacheDurationTypeChange}
              description={isCacheDurationOverridden ? undefined : inheritedDescription}
              icon={
                isCacheDurationOverridden ? (
                  <RevertToInheritedIcon
                    label={revertLabel}
                    onClick={(): void => setEmptyValue('zimbraPrefOutOfOfficeCacheDuration')}
                  />
                ) : undefined
              }
            />
          ) : (
            <></>
          )}
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="48%" mainAlignment="flex-start">
          {accountDetail?.zimbraId ? (
            <InheritedPrefSelect
              {...prefSelectProps}
              label={t('label.read_receipt_settings', 'Read Receipt settings')}
              selectName="zimbraPrefMailSendReadReceipts"
              items={SEND_READ_RECEIPTS}
              onChange={onReadReceiptChange}
            />
          ) : (
            <></>
          )}
        </Row>
      </Row>
    </>
  );
};
