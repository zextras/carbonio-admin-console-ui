/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { VERIFY_SUCCESS_AUTO_CLOSE_MS } from '../../../../constants';
import styles from './verify-success.module.css';

type VerifySuccessProps = {
  onComplete?: () => void;
};

export const VerifySuccess = ({
  onComplete,
}: VerifySuccessProps): React.JSX.Element => {
  const { t } = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    popoverRef.current?.showPopover();
    timeoutRef.current = setTimeout(() => {
      popoverRef.current?.hidePopover();
      onCompleteRef.current?.();
    }, VERIFY_SUCCESS_AUTO_CLOSE_MS);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  function handleClose(): void {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    popoverRef.current?.hidePopover();
    onCompleteRef.current?.();
  }

  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <div className={styles.header}>
        <div className={styles.imageCircle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
            <g clipPath="url(#clip0_3638_3717)">
              <path d="M24.2755 28.225C23.8047 27.7543 23.1662 27.4898 22.5005 27.4898C21.8347 27.4898 21.1962 27.7543 20.7255 28.225C20.2547 28.6958 19.9902 29.3343 19.9902 30C19.9902 30.6658 20.2547 31.3043 20.7255 31.775L28.2255 39.275C28.4591 39.5067 28.7361 39.69 29.0407 39.8144C29.3453 39.9389 29.6714 40.0019 30.0005 40C30.3427 39.9892 30.6791 39.9081 30.9887 39.7619C31.2983 39.6157 31.5746 39.4074 31.8005 39.15L49.3005 19.15C49.7045 18.6483 49.8994 18.01 49.8443 17.3682C49.7893 16.7264 49.4886 16.1306 49.005 15.705C48.5215 15.2795 47.8923 15.057 47.2486 15.084C46.605 15.111 45.9967 15.3854 45.5505 15.85L30.0005 33.85L24.2755 28.225Z" fill="#8BC34A"/>
              <path d="M52.5 27.5C51.837 27.5 51.2011 27.7634 50.7323 28.2322C50.2634 28.7011 50 29.337 50 30C50 35.3043 47.8929 40.3914 44.1422 44.1421C40.3914 47.8929 35.3044 50 30 50C26.0502 49.9982 22.1894 48.8269 18.9044 46.6338C15.6194 44.4408 13.0573 41.3241 11.5412 37.6769C10.0251 34.0297 9.62288 30.0152 10.3852 26.1397C11.1476 22.2642 13.0404 18.7012 15.825 15.9C17.6768 14.0235 19.8842 12.5351 22.3182 11.522C24.7521 10.509 27.3637 9.99152 30 10C31.5986 10.01 33.1914 10.1944 34.75 10.55C35.0762 10.6509 35.4196 10.6839 35.759 10.647C36.0984 10.6101 36.4266 10.5041 36.7235 10.3354C37.0204 10.1668 37.2796 9.93918 37.4851 9.66656C37.6906 9.39393 37.8381 9.0821 37.9185 8.75028C37.9989 8.41847 38.0104 8.07371 37.9525 7.73725C37.8945 7.40079 37.7683 7.07977 37.5815 6.79398C37.3947 6.50819 37.1514 6.26368 36.8665 6.07553C36.5816 5.88738 36.2612 5.75958 35.925 5.7C33.9829 5.24311 31.9952 5.00827 30 5C25.0609 5.02566 20.24 6.5138 16.1458 9.27663C12.0515 12.0395 8.86745 15.9532 6.99532 20.5238C5.12319 25.0945 4.64692 30.1173 5.62661 34.9584C6.6063 39.7995 8.99805 44.2419 12.5 47.725C17.1417 52.3688 23.4342 54.9847 30 55C36.6304 55 42.9893 52.3661 47.6777 47.6777C52.3661 42.9893 55 36.6304 55 30C55 29.337 54.7366 28.7011 54.2678 28.2322C53.799 27.7634 53.1631 27.5 52.5 27.5Z" fill="#8BC34A"/>
            </g>
            <defs>
              <clipPath id="clip0_3638_3717">
                <rect width="60" height="60" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={t('label.close', 'Close')}
        >
          <ds-icon icon="CloseOutline" size="24px" />
        </button>
      </div>
      <ds-text as="h2" weight="bold" size="large" className={styles.title}>
        {t('storages.s3Connectors.verifySuccess.connectorsVerified', 'Connectors verified and created')}
      </ds-text>
      <div className={styles.description}>
        <ds-text as="p" color="gray1" weight="light" size="small">
          {t(
            'storages.s3Connectors.verifySuccess.description',
            'Everything is validated, your connectors are now on',
          )}
        </ds-text>
      </div>
    </div>
  );
};
