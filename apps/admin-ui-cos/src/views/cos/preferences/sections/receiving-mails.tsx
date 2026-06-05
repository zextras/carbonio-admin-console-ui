/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Input, ListRow, Row, Select, SelectItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { findSelectItemWithFallback } from '../../utils';
import { CosPreferencesFormApi } from '../types';

type ReceivingMailsProps = {
  form: CosPreferencesFormApi;
  readonlyCOS: boolean;
};

export const ReceivingMails = ({ form, readonlyCOS }: ReceivingMailsProps) => {
  const [t] = useTranslation();

  const TIME_TYPES: Array<SelectItem> = [
    { label: `${t('label.days', 'Days')}`, value: 'd' },
    { label: `${t('label.hours', 'Hours')}`, value: 'h' },
    { label: `${t('label.minutes', 'Minutes')}`, value: 'm' },
    { label: `${t('label.seconds', 'Seconds')}`, value: 's' },
  ];

  const POLLING_INTERVAL: Array<SelectItem> = [
    {
      label: t('cos.as_new_mail_arrives', 'As New Mail Arrives'),
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
    {
      label: t('cos.manuallly', 'Manually'),
      value: '31536000s',
    },
  ];

  const SEND_READ_RECEIPTS: Array<SelectItem> = [
    {
      label: t('label.never_send_read_receipt', 'Never send a read receipt'),
      value: 'never',
    },
    {
      label: t('label.always_send_read_receipt', 'Always send a read receipt'),
      value: 'always',
    },
    { label: t('label.ask_me', 'Ask me'), value: 'prompt' },
  ];

  const minPollingInterval = useSelector(form.store, (s) => s.values.zimbraMailMinPollingInterval);

  const minPollingVal = minPollingInterval ?? '';
  const pollingIntervalNum = minPollingVal.slice(0, -1) || '';
  const pollingIntervalType = minPollingVal.slice(-1) || '';

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'large' }}
      width="100%"
    >
      <ds-text as="strong" weight="bold">
        {t('label.receiving_mails', 'Receiving Mails')}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow>
            <form.Field name="zimbraMailMinPollingInterval">
              {(field) => {
                return (
                  <>
                    <Container padding={{ right: 'small' }}>
                      <Input
                        inputName="zimbraPrefMailMinPollingInterval"
                        label={t(
                          'cos.minimum_mail_polling_interval',
                          'Minimum mail polling interval',
                        )}
                        backgroundColor="gray5"
                        value={pollingIntervalNum}
                        type="number"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                          const num = e.target.value;
                          field.handleChange(num ? `${num}${pollingIntervalType}` : '');
                        }}
                        disabled={readonlyCOS}
                      />
                    </Container>
                    <Container padding={{ left: 'small' }}>
                      <Select
                        items={TIME_TYPES}
                        background={'gray5'}
                        label={t('cos.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
                        showCheckbox={false}
                        selection={
                          pollingIntervalType === ''
                            ? (TIME_TYPES.at(-1) ?? TIME_TYPES[0])
                            : TIME_TYPES.find((item) => item.value === pollingIntervalType) ??
                              TIME_TYPES[0]
                        }
                        onChange={(value): void => {
                          const v =
                            typeof value === 'object' && value !== null && 'value' in value
                              ? (value as SelectItem).value
                              : (value as string);
                          field.handleChange(pollingIntervalNum ? `${pollingIntervalNum}${v}` : '');
                        }}
                        disabled={readonlyCOS}
                      />
                    </Container>
                  </>
                );
              }}
            </form.Field>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="center" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large', bottom: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start">
              <form.Field name="zimbraPrefMailPollingInterval">
                {(field) => (
                  <Select
                    items={POLLING_INTERVAL}
                    background={'gray5'}
                    label={t('cos.polling_interval', 'Polling interval')}
                    showCheckbox={false}
                    selection={
                      field.state.value === ''
                        ? (POLLING_INTERVAL.at(-1) ?? POLLING_INTERVAL[0])
                        : POLLING_INTERVAL.find((item) => item.value === field.state.value) ??
                          POLLING_INTERVAL[0]
                    }
                    onChange={(value): void => {
                      const v =
                        typeof value === 'object' && value !== null && 'value' in value
                          ? (value as SelectItem).value
                          : (value as string);
                      field.handleChange(v);
                    }}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ bottom: 'large' }}
        >
          <ListRow>
            <Container>
              <form.Field name="zimbraPrefMailSendReadReceipts">
                {(field) => (
                  <Select
                    items={SEND_READ_RECEIPTS}
                    background="gray5"
                    label={t('cos.read_receipt_settings', 'Read Receipt settings')}
                    showCheckbox={false}
                    selection={
                      findSelectItemWithFallback(SEND_READ_RECEIPTS, field.state.value) ??
                      SEND_READ_RECEIPTS[0]
                    }
                    onChange={(value): void => {
                      const v =
                        typeof value === 'object' && value !== null && 'value' in value
                          ? (value as SelectItem).value
                          : (value as string);
                      field.handleChange(v);
                    }}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Row>
  );
};
