/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './collapser.module.css';

type CollapserProps = { open: boolean; onClick: () => void };

export function Collapser({ open, onClick }: CollapserProps) {
  return (
    <div className={styles.verticalDivider}>
      <button
        type="button"
        className={styles.bubble}
        onClick={onClick}
        data-open={open}
        aria-expanded={open}
        aria-label={open ? 'Collapse navigation' : 'Expand navigation'}
      >
        <ds-icon size="medium" icon="ChevronLeft"></ds-icon>
      </button>
    </div>
  );
}
