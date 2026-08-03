/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button } from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import type { CreateCosFormApi } from '../types';
import styles from './steps.module.css';

type StepFooterProps = {
  form: CreateCosFormApi;
  isFirstStep?: boolean;
  onBack?: () => void;
  onPrimary: () => void;
};

export const StepFooter = ({
  form,
  isFirstStep = false,
  onBack,
  onPrimary,
}: StepFooterProps) => {
  const [t] = useTranslation();
  return (
    <div className={styles.footer}>
      <Button
        label={t('label.cancel', 'Cancel')}
        icon="Close"
        color="secondary"
        onClick={() => replaceHistory('/')}
      />
      <div className={styles.footerActions}>
        {!isFirstStep && onBack && (
          <Button
            label={t('label.back', 'BACK')}
            color="secondary"
            onClick={onBack}
          />
        )}
        <Button
          label={isFirstStep ? t('label.next', 'Next') : t('label.create', 'create')}
          icon={isFirstStep ? 'ArrowForwardOutline' : 'CheckmarkCircle'}
          color="primary"
          disabled={!form.state.canSubmit}
          onClick={onPrimary}
        />
      </div>
    </div>
  );
};
