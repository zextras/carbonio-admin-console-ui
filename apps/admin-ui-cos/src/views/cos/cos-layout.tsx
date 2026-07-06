/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getResponsiveContainerStyle, useBreakpoint, usePrimaryBarState } from '@zextras/ui-shared';
import type { ReactNode } from 'react';

import styles from './cos-layout.module.css';
import { CosListPanel } from './cos-list-panel';

const COS_LIST_PANEL_WIDTH_PX = 265;

type CosLayoutVariant = 'list' | 'detail' | 'fullWidth';

type CosLayoutProps = {
  children: ReactNode;
  variant?: CosLayoutVariant;
};

export const CosLayout = ({ children, variant = 'list' }: CosLayoutProps) => {
  const breakpoint = useBreakpoint();
  const isPrimaryBarExpanded = usePrimaryBarState();
  const containerStyle = getResponsiveContainerStyle({
    breakpoint,
    isPrimaryBarExpanded,
    sidePanelOffsetPx: variant === 'fullWidth' ? 0 : COS_LIST_PANEL_WIDTH_PX,
  });

  if (variant === 'fullWidth') {
    return (
      <div className={styles.fullWidthCenter}>
        <div style={containerStyle}>{children}</div>
      </div>
    );
  }

  return (
    <>
      <CosListPanel />
      <div className={styles.detailPanel}>
        <div style={containerStyle}>
          <div className={styles.contentCenter}>{children}</div>
        </div>
      </div>
    </>
  );
};
