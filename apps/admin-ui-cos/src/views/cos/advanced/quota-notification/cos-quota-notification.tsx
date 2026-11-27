/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Radio, Select } from '@zextras/ui-components';
import type {
  QuotaNotificationConfig,
  QuotaNotificationField,
  QuotaNotificationIntervalDays,
  QuotaNotificationPlaceholder,
  QuotaNotificationState,
} from '@zextras/ui-shared';
import {
  countCodePoints,
  getQuotaNotificationPlaceholderToken,
  QUOTA_NOTIFICATION_FIELD_MAX_LENGTH,
  QUOTA_NOTIFICATION_INTERVALS,
} from '@zextras/ui-shared';
import { useId, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CustomCard } from './custom-card';
import styles from './quota-notification.module.css';
import { ReferenceCard } from './reference-card';
import { getIntervalLabel } from './utils';

export type QuotaNotificationHandle = {
  /** Called by the form after a failed validation, to focus the first invalid field. */
  focusField: (field: QuotaNotificationField) => void;
};

type CosQuotaNotificationProps = {
  state: QuotaNotificationState;
  config: QuotaNotificationConfig;
  readonlyCOS: boolean;
  ref?: React.Ref<QuotaNotificationHandle>;
};

export const CosQuotaNotification = ({
  state,
  config,
  readonlyCOS,
  ref,
}: CosQuotaNotificationProps) => {
  const [t] = useTranslation();
  const titleId = useId();
  const defaultCardId = useId();
  const customCardId = useId();
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [activeField, setActiveField] = useState<QuotaNotificationField | null>(null);
  const [noRoomField, setNoRoomField] = useState<QuotaNotificationField | null>(null);

  useImperativeHandle(ref, () => ({
    focusField: (field) => {
      // wait for the render that opens a collapsed card
      requestAnimationFrame(() => {
        (field === 'subject' ? subjectRef : messageRef).current?.focus();
      });
    },
  }));

  const intervalItems = QUOTA_NOTIFICATION_INTERVALS.map((days) => ({
    label: getIntervalLabel(t, days),
    value: days,
  }));
  const intervalSelection =
    intervalItems.find((item) => item.value === state.interval) ?? intervalItems[1];

  const hasCustomText = state.subject !== '' || state.body !== '';
  const isCustom = state.option === 'custom';

  function handleBlur(event: React.FocusEvent): void {
    const next = event.relatedTarget;
    const staysInEditor =
      next === subjectRef.current ||
      next === messageRef.current ||
      (next instanceof HTMLElement && next.dataset.chip !== undefined);
    if (!staysInEditor) {
      setActiveField(null);
    }
  }

  function handleInsert(placeholder: QuotaNotificationPlaceholder): void {
    if (!activeField) {
      return;
    }
    const element = activeField === 'subject' ? subjectRef.current : messageRef.current;
    if (!element) {
      return;
    }
    const token = getQuotaNotificationPlaceholderToken(placeholder);
    const current = activeField === 'subject' ? state.subject : state.body;
    const start = element.selectionStart ?? current.length;
    const end = element.selectionEnd ?? start;
    const next = `${current.slice(0, start)}${token}${current.slice(end)}`;

    if (countCodePoints(next) > QUOTA_NOTIFICATION_FIELD_MAX_LENGTH[activeField]) {
      setNoRoomField(activeField);
      element.focus();
      return;
    }
    setNoRoomField(null);
    if (activeField === 'subject') {
      state.setSubject(next);
    } else {
      state.setBody(next);
    }
    const caret = start + token.length;
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(caret, caret);
    });
  }

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <ds-text as="strong" weight="bold" id={titleId}>
        {t('cos.quota_notification.title', 'Quota Notification Email')}
      </ds-text>

      <div className={styles.frequency}>
        <Select<QuotaNotificationIntervalDays>
          label={t('cos.quota_notification.frequency', 'Frequency')}
          items={intervalItems}
          selection={intervalSelection}
          onChange={(days) => state.setInterval(days)}
          disabled={readonlyCOS}
          description={t(
            'cos.quota_notification.frequency_help',
            'How often a user whose storage stays over the threshold receives the email again.',
          )}
        />
      </div>

      <div className={styles.options} role="radiogroup" aria-labelledby={titleId}>
        <div className={styles.option}>
          <Radio
            name="quota-notification-option"
            label={t('cos.quota_notification.option_default', 'Use the Carbonio default text')}
            checked={!isCustom}
            disabled={readonlyCOS}
            padding={{ bottom: 'none' }}
            aria-describedby={defaultCardId}
            onClick={() => state.setOption('inherit')}
          />
          <ReferenceCard
            id={defaultCardId}
            subject={config.content.inherited.subject}
            message={config.content.inherited.body}
            isOpen={state.isCardOpen('inherit')}
            onToggle={() => state.toggleCard('inherit')}
          />
        </div>

        <div className={styles.option}>
          <Radio
            name="quota-notification-option"
            label={t('cos.quota_notification.option_custom', 'Use a custom message for this COS')}
            checked={isCustom}
            disabled={readonlyCOS}
            padding={{ bottom: 'none' }}
            aria-describedby={customCardId}
            onClick={() => state.setOption('custom')}
          />
          {(isCustom || hasCustomText) && (
            <CustomCard
              id={customCardId}
              title={t('cos.quota_notification.custom_card_title', 'Custom message for this COS')}
              helper={t(
                'cos.quota_notification.custom_card_help',
                'This message is sent to each user in this COS when their storage passes the quota threshold. The sender address follows the domain of the recipient. Placeholders like {{example}} are replaced with each user’s real values when the email is sent.',
                { example: getQuotaNotificationPlaceholderToken('quotaLimit') },
              )}
              isEditable={isCustom}
              isOpen={state.isCardOpen('custom')}
              onToggle={() => state.toggleCard('custom')}
              subject={state.subject}
              message={state.body}
              errors={state.errors}
              noRoomField={noRoomField}
              activeField={activeField}
              disabled={readonlyCOS}
              subjectRef={subjectRef}
              messageRef={messageRef}
              onSubjectChange={(value) => {
                setNoRoomField(null);
                state.setSubject(value);
              }}
              onMessageChange={(value) => {
                setNoRoomField(null);
                state.setBody(value);
              }}
              onFieldFocus={setActiveField}
              onFieldBlur={handleBlur}
              onInsert={handleInsert}
            />
          )}
        </div>
      </div>
      <ds-divider></ds-divider>
    </section>
  );
};
