/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import styles from './steps.module.css';

type FeatureColumnProps = {
  title: string;
  children: ReactNode;
};

export const FeatureColumn = ({ title, children }: FeatureColumnProps) => (
  <div className={styles.featureColumn}>
    <ds-text as="strong" size="small" weight="bold" color="gray0">
      {title}
    </ds-text>
    {children}
  </div>
);
