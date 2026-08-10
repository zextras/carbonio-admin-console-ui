/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import styles from './steps.module.css';

type FeatureRowProps = {
  children: ReactNode;
  divider?: boolean;
};

export const FeatureRow = ({ children, divider = true }: FeatureRowProps) => (
  <>
    <div className={styles.featureRow}>{children}</div>
    {divider ? <ds-divider></ds-divider> : null}
  </>
);
