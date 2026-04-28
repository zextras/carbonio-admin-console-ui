/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FunctionComponent } from 'react';

import styles from './collapser.module.css';

export const Collapser: FunctionComponent<{ open: boolean; onClick: () => void }> = ({
  open,
  onClick,
}) => (
  <div className={styles.verticalDivider}>
    <button
      type="button"
      className={styles.bubble}
      onClick={onClick}
      data-open={open}
    >
      <ds-icon size="medium" icon="ChevronLeft"></ds-icon>
    </button>
  </div>
);
