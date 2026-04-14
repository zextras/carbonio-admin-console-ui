/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Text } from '@zextras/ui-components';
import React, { useEffect, useRef } from 'react';

import styles from './activation-success.module.css';

type ActivationSuccessProps = {
  isSuccess: boolean;
};

export const ActivationSuccess = ({
  isSuccess,
}: ActivationSuccessProps): React.JSX.Element => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isSuccess) {
      popoverRef.current?.showPopover();
      timeoutRef.current = setTimeout(() => {
        popoverRef.current?.hidePopover();
      }, 3000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isSuccess]);

  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <Text weight="bold" size="large">
        Subscription activated
      </Text>
      <div className={styles.description}>
        <Text color="gray0">Everything is validated, your license is now active</Text>
      </div>
    </div>
  );
};
