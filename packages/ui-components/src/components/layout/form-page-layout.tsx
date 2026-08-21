/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../basic/button/Button';
import { RouteLeavingGuard } from '../navigation/route-leaving-guard';
import styles from './form-page-layout.module.css';

type FormPageLayoutProps = {
  title: string;
  children: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  unsavedChanges?: boolean;
};

export const FormPageLayout = ({
  title,
  onSave,
  onCancel,
  unsavedChanges,
  children,
}: FormPageLayoutProps) => {
  const [t] = useTranslation();

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSave?.();
      }}
    >
      <div className={styles.stickyHeader}>
        <div className={styles.header}>
          <ds-text as="h2" weight="bold" color="gray0" className={styles.title}>
            {title}
          </ds-text>
          {unsavedChanges && (
            <div className={styles.buttons}>
              {onCancel && (
                <Button
                  label={t('label.cancel', 'Cancel')}
                  color="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    onCancel();
                  }}
                />
              )}
              {onSave && (
                <Button
                  label={t('label.save', 'Save')}
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    onSave();
                  }}
                />
              )}
            </div>
          )}
        </div>
        <ds-divider></ds-divider>
      </div>
      <div className={styles.content}>{children}</div>
      {onSave && <RouteLeavingGuard when={unsavedChanges} onSave={onSave} />}
    </form>
  );
};
