/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './page-layout.module.css';
import { RouteLeavingGuard } from './ui-extras/nav-guard';

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
      <div className={styles.header}>
        <ds-text as="strong" weight="bold" color="gray0" className={styles.title}>
          {title}
        </ds-text>
        {unsavedChanges && (
          <div className={styles.buttons}>
            {onCancel && (
              <Button
                label={t('label.cancel', 'Cancel')}
                color="secondary"
                onClick={onCancel}
              />
            )}
            {onSave && (
              <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
            )}
          </div>
        )}
      </div>
      <ds-divider></ds-divider>
      <div className={styles.content}>
        {children}
      </div>
      {onSave && (
        <RouteLeavingGuard when={unsavedChanges} onSave={onSave}>
          <ds-text as="p">
            {t(
              'label.unsaved_changes_line1',
              'Are you sure you want to leave this page without saving?',
            )}
          </ds-text>
          <ds-text as="p">
            {t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}
          </ds-text>
        </RouteLeavingGuard>
      )}
    </form>
  );
};
