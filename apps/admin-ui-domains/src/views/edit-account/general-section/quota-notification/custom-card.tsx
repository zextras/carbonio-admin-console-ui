/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PlainTextarea, TextInput } from '@zextras/ui-components';
import type {
  QuotaNotificationField,
  QuotaNotificationFieldErrors,
  QuotaNotificationPlaceholder,
} from '@zextras/ui-shared';
import {
  getQuotaNotificationPlaceholderToken,
  QUOTA_NOTIFICATION_PLACEHOLDERS,
} from '@zextras/ui-shared';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './quota-notification.module.css';
import { getFieldFeedback, getPlaceholderLabel } from './utils';

type EditorProps = {
  subject: string;
  message: string;
  errors: QuotaNotificationFieldErrors;
  noRoomField: QuotaNotificationField | null;
  activeField: QuotaNotificationField | null;
  disabled: boolean;
  subjectRef: React.Ref<HTMLInputElement>;
  messageRef: React.Ref<HTMLTextAreaElement>;
  onSubjectChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onFieldFocus: (field: QuotaNotificationField) => void;
  onFieldBlur: (event: React.FocusEvent) => void;
  onInsert: (placeholder: QuotaNotificationPlaceholder) => void;
};

type CustomCardProps = EditorProps & {
  id: string;
  title: string;
  helper: string;
  /** The card shows the editor when the custom message is selected, a read-only copy otherwise. */
  isEditable: boolean;
  isOpen: boolean;
  onToggle: () => void;
};

type ReadOnlyValuesProps = { subject: string; message: string };

const ReadOnlyValues = ({ subject, message }: ReadOnlyValuesProps) => {
  const [t] = useTranslation();
  return (
    <dl className={styles.values}>
      <dt>{t('account_details.quota_notification.subject', 'Subject')}</dt>
      <dd className={subject ? undefined : styles.emptyValue}>
        {subject || t('account_details.quota_notification.no_subject', 'No subject')}
      </dd>
      <dt>{t('account_details.quota_notification.message', 'Message')}</dt>
      <dd className={message ? undefined : styles.emptyValue}>
        {message || t('account_details.quota_notification.no_message', 'No message')}
      </dd>
    </dl>
  );
};

type PlaceholderChipsProps = {
  disabled: boolean;
  onInsert: (placeholder: QuotaNotificationPlaceholder) => void;
  onBlur: (event: React.FocusEvent) => void;
};

const PlaceholderChips = ({ disabled, onInsert, onBlur }: PlaceholderChipsProps) => {
  const [t] = useTranslation();
  const labelId = useId();

  return (
    <div className={styles.chipsField}>
      <span id={labelId} className={styles.helper}>
        {t('account_details.quota_notification.insert_value', 'Insert value:')}
      </span>
      <div role="group" aria-labelledby={labelId} className={styles.chips}>
        {QUOTA_NOTIFICATION_PLACEHOLDERS.map((placeholder) => (
          <button
            key={placeholder}
            type="button"
            className={styles.chip}
            title={getQuotaNotificationPlaceholderToken(placeholder)}
            disabled={disabled}
            data-chip=""
            // keeps the focus (and the caret) in the field the value is inserted into
            onMouseDown={(e) => e.preventDefault()}
            onBlur={onBlur}
            onClick={() => onInsert(placeholder)}
          >
            {getPlaceholderLabel(t, placeholder)}
          </button>
        ))}
      </div>
    </div>
  );
};

const Editor = ({
  subject,
  message,
  errors,
  noRoomField,
  activeField,
  disabled,
  subjectRef,
  messageRef,
  onSubjectChange,
  onMessageChange,
  onFieldFocus,
  onFieldBlur,
  onInsert,
  helper,
}: EditorProps & { helper: string }) => {
  const [t] = useTranslation();
  const subjectFeedback = getFieldFeedback(t, 'subject', subject, errors.subject, noRoomField === 'subject');
  const messageFeedback = getFieldFeedback(t, 'body', message, errors.body, noRoomField === 'body');

  return (
    <div className={styles.cardBody}>
      <TextInput
        label={t('account_details.quota_notification.subject_label', 'Notification subject')}
        value={subject}
        ref={subjectRef}
        autoComplete="off"
        disabled={disabled}
        hasError={!!errors.subject}
        description={subjectFeedback.description}
        chip={subjectFeedback.counter}
        onChange={(e) => onSubjectChange(e.target.value)}
        onFocus={() => onFieldFocus('subject')}
        onBlur={onFieldBlur}
      />
      <PlaceholderChips
        disabled={disabled || activeField === null}
        onInsert={onInsert}
        onBlur={onFieldBlur}
      />
      <PlainTextarea
        label={t('account_details.quota_notification.message_label', 'Notification message')}
        value={message}
        ref={messageRef}
        rows={7}
        placeholder={t('account_details.quota_notification.message_placeholder', 'Write the email your users receive')}
        disabled={disabled}
        hasError={!!errors.body}
        description={messageFeedback.description}
        chip={messageFeedback.counter}
        onChange={(e) => onMessageChange(e.target.value)}
        onFocus={() => onFieldFocus('body')}
        onBlur={onFieldBlur}
      />
      <p className={styles.helper}>{helper}</p>
    </div>
  );
};

export const CustomCard = ({
  id,
  title,
  helper,
  isEditable,
  isOpen,
  onToggle,
  ...editorProps
}: CustomCardProps) => {
  const [t] = useTranslation();
  const titleId = useId();
  const bodyId = useId();

  return (
    <div id={id} role="group" aria-labelledby={titleId} className={`${styles.card} ${styles.cardEdit}`}>
      <div className={styles.cardHead}>
        <p id={titleId} className={styles.cardTitle}>
          {title}
        </p>
        <button
          type="button"
          className={styles.disclose}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          {isOpen ? t('account_details.quota_notification.hide', 'Hide') : t('account_details.quota_notification.show', 'Show')}
        </button>
      </div>
      <div id={bodyId} hidden={!isOpen}>
        {isEditable ? (
          <Editor {...editorProps} helper={helper} />
        ) : (
          <ReadOnlyValues subject={editorProps.subject} message={editorProps.message} />
        )}
      </div>
    </div>
  );
};
