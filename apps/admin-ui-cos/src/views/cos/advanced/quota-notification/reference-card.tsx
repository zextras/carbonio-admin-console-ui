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
  subject: string;
  message: string;
  isOpen: boolean;
  onToggle: () => void;
};

/** Read-only Carbonio default text, shown with no lock icon. */
export const ReferenceCard = ({ id, subject, message, isOpen, onToggle }: ReferenceCardProps) => {
  const [t] = useTranslation();
  const titleId = useId();
  const bodyId = useId();

  return (
    <div id={id} role="group" aria-labelledby={titleId} className={`${styles.card} ${styles.cardReference}`}>
      <div className={styles.cardHead}>
        <p id={titleId} className={styles.cardTitle}>
          {t('cos.quota_notification.default_card_title', 'Carbonio default text')}
        </p>
        <button
          type="button"
          className={styles.disclose}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          {isOpen ? t('cos.quota_notification.hide', 'Hide') : t('cos.quota_notification.show', 'Show')}
        </button>
      </div>
      <div id={bodyId} className={styles.cardBody} hidden={!isOpen}>
        <dl className={styles.values}>
          <dt>{t('cos.quota_notification.subject', 'Subject')}</dt>
          <dd>{subject}</dd>
          <dt>{t('cos.quota_notification.message', 'Message')}</dt>
          <dd>{message}</dd>
        </dl>
        <p className={styles.helper}>
          {t(
            'cos.quota_notification.default_card_help',
            'Carbonio sends this text to every user of this COS whose storage passes the quota threshold. Placeholders are replaced with real values.',
          )}
        </p>
      </div>
    </div>
  );
};
