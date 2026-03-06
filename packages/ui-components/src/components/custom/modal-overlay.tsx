/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useRef } from 'react';

import styles from './modal-overlay.module.css';

type ModalOverlayProps = {
  open: boolean;
  maxWidth?: string;
  children?: React.ReactNode;
};

export const ModalOverlay = ({ children, open, maxWidth }: ModalOverlayProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflowY = 'hidden';
    }
  }, [open]);

  return (
    <div className={styles.overlayContainer}>
      <div
        ref={ref}
        className={styles.subOverlayContainer}
        style={
          maxWidth ? ({ '--modal-overlay-max-width': maxWidth } as React.CSSProperties) : undefined
        }
      >
        {children}
      </div>
    </div>
  );
};
