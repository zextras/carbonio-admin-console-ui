/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';

import styles from './volume-error-details-modal.module.css';

type VolumeErrorDetailsModalProps = {
  readonly open: boolean;
  readonly message: string;
  readonly onClose: () => void;
};

export function VolumeErrorDetailsModal({
  open,
  message,
  onClose,
}: VolumeErrorDetailsModalProps) {
  const [t] = useTranslation();

  if (!open) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <dialog className={styles.dialog} aria-modal="true" open>
        <div className={styles.modalBody}>
          <div className={styles.header}>
            <div className={styles.imageCircle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
                <g clipPath="url(#clip0_3638_3736)">
                  <path
                    d="M56.3998 40.75L37.2248 8.95C36.4494 7.73704 35.3811 6.73881 34.1185 6.04734C32.8558 5.35588 31.4394 4.99344 29.9998 4.99344C28.5602 4.99344 27.1437 5.35588 25.8811 6.04734C24.6184 6.73881 23.5501 7.73704 22.7748 8.95L3.59976 40.75C2.9224 41.8791 2.55423 43.1667 2.53229 44.4832C2.51035 45.7998 2.8354 47.0989 3.47476 48.25C4.21396 49.5457 5.28391 50.6218 6.57527 51.3685C7.86662 52.1152 9.33308 52.5057 10.8248 52.5H49.1748C50.6566 52.5158 52.1165 52.1405 53.407 51.4118C54.6974 50.6832 55.7729 49.6271 56.5248 48.35C57.1829 47.1869 57.5183 45.8692 57.4964 44.533C57.4744 43.1968 57.0958 41.8908 56.3998 40.75ZM52.1498 45.875C51.8493 46.3915 51.4133 46.8159 50.8889 47.1024C50.3645 47.3888 49.7717 47.5263 49.1748 47.5H10.8248C10.2278 47.5263 9.63505 47.3888 9.11066 47.1024C8.58626 46.8159 8.15023 46.3915 7.84976 45.875C7.63034 45.4949 7.51483 45.0638 7.51483 44.625C7.51483 44.1862 7.63034 43.755 7.84976 43.375L27.0498 11.55C27.3948 11.0943 27.8407 10.7247 28.3525 10.4702C28.8643 10.2157 29.4282 10.0833 29.9998 10.0833C30.5714 10.0833 31.1352 10.2157 31.647 10.4702C32.1588 10.7247 32.6048 11.0943 32.9498 11.55L52.1248 43.35C52.3527 43.7308 52.4751 44.1654 52.4795 44.6091C52.4839 45.0529 52.3701 45.4898 52.1498 45.875Z"
                    fill="#D74942"
                  />
                  <path
                    d="M30 42.5C31.3807 42.5 32.5 41.3807 32.5 40C32.5 38.6193 31.3807 37.5 30 37.5C28.6193 37.5 27.5 38.6193 27.5 40C27.5 41.3807 28.6193 42.5 30 42.5Z"
                    fill="#D74942"
                  />
                  <path
                    d="M30 20C29.337 20 28.7011 20.2634 28.2322 20.7322C27.7634 21.2011 27.5 21.837 27.5 22.5V32.5C27.5 33.163 27.7634 33.7989 28.2322 34.2678C28.7011 34.7366 29.337 35 30 35C30.663 35 31.2989 34.7366 31.7678 34.2678C32.2366 33.7989 32.5 33.163 32.5 32.5V22.5C32.5 21.837 32.2366 21.2011 31.7678 20.7322C31.2989 20.2634 30.663 20 30 20Z"
                    fill="#D74942"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_3638_3736">
                    <rect width="60" height="60" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label={t('label.close', 'Close')}
            >
              <ds-icon icon="CloseOutline" size="24px" />
            </button>
          </div>
          <div className={styles.content}>
            <ds-text as="h2" weight="bold" size="large" className={styles.title}>
              {t('storage.dataVolumes.errorDetails.title', 'Something went wrong details')}
            </ds-text>
            <ds-text
              as="p"
              color="gray1"
              weight="light"
              size="medium"
              overflow="break-word"
              style={{ whiteSpace: 'pre-line' }}
            >
              {message}
            </ds-text>
          </div>
        </div>
      </dialog>
    </div>
  );
}