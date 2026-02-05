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
    <div className={styles.bubble} onClick={onClick} data-open={open}>
      <icon-wc size="medium" icon-name="ChevronLeft"></icon-wc>
    </div>
  </div>
);
