/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import type { CreateCosFormApi, CreateCosFormValues } from '../types';
import { FeaturesHeader } from './features-header';
import { StepFooter } from './step-footer';
import { StepHeader } from './step-header';
import styles from './steps.module.css';

type Step2LayoutProps = {
  form: CreateCosFormApi;
  onBack: () => void;
  featureKeys: Array<keyof CreateCosFormValues>;
  children: ReactNode;
};

export const Step2Layout = ({ form, onBack, featureKeys, children }: Step2LayoutProps) => (
  <div className={styles.root}>
    <StepHeader />
    <div className={styles.scrollArea}>
      <div className={styles.formRow}>
        <div className={styles.formPanel}>
          <FeaturesHeader form={form} featureKeys={featureKeys} />
          {children}
        </div>
      </div>
    </div>
    <StepFooter form={form} onBack={onBack} onPrimary={() => form.handleSubmit()} />
  </div>
);
