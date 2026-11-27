/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Radio, Select } from '@zextras/ui-components';
import type {
  QuotaNotificationConfig,
  QuotaNotificationField,
  QuotaNotificationIntervalChoice,
  QuotaNotificationPlaceholder,
  QuotaNotificationSource,
  QuotaNotificationState,
} from '@zextras/ui-shared';
import {
  countCodePoints,
  getQuotaNotificationPlaceholderToken,
  QUOTA_NOTIFICATION_FIELD_MAX_LENGTH,
  QUOTA_NOTIFICATION_INTERVALS,
} from '@zextras/ui-shared';
import type { TFunction } from 'i18next';
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

type AccountQuotaNotificationProps = {
  state: QuotaNotificationState;
  config: QuotaNotificationConfig;
  ref?: React.Ref<QuotaNotificationHandle>;
};

const KEY = 'account_details.quota_notification';

function getCosName(source: QuotaNotificationSource): string {
  return source.name ?? '';
}

function getInheritedOptionLabel(t: TFunction, source: QuotaNotificationSource): string {
  if (source.type === 'COS') {
    return t(
      `${KEY}.option_inherit_cos`,
      'Use the message inherited from the COS ({{cos}})',
      { cos: getCosName(source) },
    );
  }
  return t(`${KEY}.option_inherit_default`, 'Use the Carbonio default text, inherited from the COS');
}

function getInheritedCardTitle(t: TFunction, source: QuotaNotificationSource): string {
  if (source.type === 'COS') {
    return t(`${KEY}.inherited_card_title_cos`, 'Message inherited from the COS ({{cos}})', {
      cos: getCosName(source),
    });
  }
  return t(`${KEY}.inherited_card_title_default`, 'Carbonio default text, inherited from the COS');
}

function getInheritedCardHelper(
  t: TFunction,
  source: QuotaNotificationSource,
  example: string,
): string {
  if (source.type === 'COS') {
    return t(
      `${KEY}.inherited_card_help_cos`,
      'This user receives the custom message set on the COS ({{cos}}), and it changes whenever the COS message changes. Placeholders like {{example}} are replaced with the real values of the user.',
      { cos: getCosName(source), example },
    );
  }
  return t(
    `${KEY}.inherited_card_help_default`,
    'The COS uses the Carbonio default text, so this user receives it too. If the COS message changes, this user receives the new one. Placeholders are replaced with the real values of the user.',
  );
}

function getIntervalText(t: TFunction, days: number): string {
  if (days === 1) {
    return t(`${KEY}.every_day_inline`, 'every day');
  }
  return t(`${KEY}.every_n_days_inline`, 'every {{days}} days', { days });
}

function getInheritedIntervalLabel(
  t: TFunction,
  days: number,
  source: QuotaNotificationSource,
): string {
  const interval = getIntervalText(t, days);
  if (source.type === 'COS') {
    return t(`${KEY}.frequency_same_as_cos`, 'Same as the COS ({{interval}})', { interval });
  }
  return t(`${KEY}.frequency_same_as_default`, 'Same as the Carbonio default ({{interval}})', {
    interval,
  });
}

function getFrequencyHelper(
  t: TFunction,
  choice: QuotaNotificationIntervalChoice,
  source: QuotaNotificationSource,
): string {
  if (choice !== 'inherit') {
    return t(`${KEY}.frequency_help_own`, 'Set for this user only. It no longer follows the COS.');
  }
  if (source.type === 'COS') {
    return t(
      `${KEY}.frequency_help_inherited_cos`,
      'Inherited from the COS ({{cos}}). Choose a value to set a different frequency for this user.',
      { cos: getCosName(source) },
    );
  }
  return t(
    `${KEY}.frequency_help_inherited_default`,
    'Inherited from the Carbonio default. Choose a value to set a different frequency for this user.',
  );
}

export const AccountQuotaNotification = ({ state, config, ref }: AccountQuotaNotificationProps) => {
  const [t] = useTranslation();
  const titleId = useId();
  const inheritCardId = useId();
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

  const inheritedContentSource = config.content.inherited.source;
  const inheritedIntervalSource = config.interval.inherited.source;

  const intervalItems: Array<{ label: string; value: QuotaNotificationIntervalChoice }> = [
    {
      label: getInheritedIntervalLabel(t, config.interval.inherited.days, inheritedIntervalSource),
      value: 'inherit',
    },
    ...QUOTA_NOTIFICATION_INTERVALS.map((days) => ({
      label: getIntervalLabel(t, days),
      value: days,
    })),
  ];
  const intervalSelection =
    intervalItems.find((item) => item.value === state.interval) ?? intervalItems[0];

  const hasCustomText = state.subject !== '' || state.body !== '';
  const isCustom = state.option === 'custom';
  const example = getQuotaNotificationPlaceholderToken('quotaLimit');

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
        {t(`${KEY}.title`, 'Quota Notification Email')}
      </ds-text>

      <div className={styles.frequency}>
        <Select<QuotaNotificationIntervalChoice>
          label={t(`${KEY}.frequency`, 'Frequency')}
          items={intervalItems}
          selection={intervalSelection}
          onChange={(choice) => state.setInterval(choice)}
          description={getFrequencyHelper(t, state.interval, inheritedIntervalSource)}
        />
      </div>

      <div className={styles.options} role="radiogroup" aria-labelledby={titleId}>
        <div className={styles.option}>
          <Radio
            name="account-quota-notification-option"
            label={getInheritedOptionLabel(t, inheritedContentSource)}
            checked={!isCustom}
            padding={{ bottom: 'none' }}
            aria-describedby={inheritCardId}
            onClick={() => state.setOption('inherit')}
          />
          <ReferenceCard
            id={inheritCardId}
            title={getInheritedCardTitle(t, inheritedContentSource)}
            helper={getInheritedCardHelper(t, inheritedContentSource, example)}
            subject={config.content.inherited.subject}
            message={config.content.inherited.body}
            isOpen={state.isCardOpen('inherit')}
            onToggle={() => state.toggleCard('inherit')}
          />
        </div>

        <div className={styles.option}>
          <Radio
            name="account-quota-notification-option"
            label={t(`${KEY}.option_custom`, 'Use a custom message for this account')}
            checked={isCustom}
            padding={{ bottom: 'none' }}
            aria-describedby={customCardId}
            onClick={() => state.setOption('custom')}
          />
          {(isCustom || hasCustomText) && (
            <CustomCard
              id={customCardId}
              title={t(`${KEY}.custom_card_title`, 'Custom message for this account')}
              helper={t(
                `${KEY}.custom_card_help`,
                'This message is sent only to this user when their storage passes the quota threshold. It no longer follows the COS message. The sender address follows the domain of the recipient. Placeholders like {{example}} are replaced with the real values of the user when the email is sent.',
                { example },
              )}
              isEditable={isCustom}
              isOpen={state.isCardOpen('custom')}
              onToggle={() => state.toggleCard('custom')}
              subject={state.subject}
              message={state.body}
              errors={state.errors}
              noRoomField={noRoomField}
              activeField={activeField}
              disabled={false}
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
    </section>
  );
};
