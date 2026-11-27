/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './quota-notification.module.css';

type ReferenceCardProps = {
  id: string;
  /** Says where the text comes from: the COS, or the Carbonio default inherited through the COS. */
  title: string;
  helper: string;
  subject: string;
  message: string;
  isOpen: boolean;
  onToggle: () => void;
};

/** Read-only inherited text, shown with no lock icon. */
export const ReferenceCard = ({
  id,
  title,
  helper,
  subject,
  message,
  isOpen,
  onToggle,
}: ReferenceCardProps) => {
  const [t] = useTranslation();
  const titleId = useId();
  const bodyId = useId();

  return (
    <div
      id={id}
      role="group"
      aria-labelledby={titleId}
      className={`${styles.card} ${styles.cardReference}`}
    >
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
          {isOpen
            ? t('account_details.quota_notification.hide', 'Hide')
            : t('account_details.quota_notification.show', 'Show')}
        </button>
      </div>
      <div id={bodyId} className={styles.cardBody} hidden={!isOpen}>
        <dl className={styles.values}>
          <dt>{t('account_details.quota_notification.subject', 'Subject')}</dt>
          <dd>{subject}</dd>
          <dt>{t('account_details.quota_notification.message', 'Message')}</dt>
          <dd>{message}</dd>
        </dl>
        <p className={styles.helper}>{helper}</p>
      </div>
    </div>
  );
};
