/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Padding, Row } from '@zextras/ui-components';
import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { RouteLeavingGuard } from './ui-extras/nav-guard';

export const PageLayout: FC<{
  title: string;
  children: ReactNode | ReactNode[];
  onSave?: () => void;
  onCancel?: () => void;
  unSavedChanges?: boolean;
}> = ({ title, onSave, onCancel, unSavedChanges, children }) => {
  const [t] = useTranslation();

  const headerButtons = (() => {
    if (!unSavedChanges) return null;
    return (
      <Container orientation="horizontal" width="fit" gap="1rem">
        {onCancel && (
          <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
        )}
        {onSave && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
      </Container>
    );
  })();

  return (
    <Container mainAlignment="flex-start" padding={{ all: 'large' }}>
      <Container orientation="horizontal" height="fit" padding={{ all: 'medium' }}>
        <Row takeAvailableSpace mainAlignment="flex-start" minHeight="35px">
          <ds-text as="strong" weight="bold" color="gray0">
            {title}
          </ds-text>
        </Row>
        <Row>{headerButtons}</Row>
      </Container>
      <ds-divider></ds-divider>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ horizontal: 'medium', vertical: 'large' }}
        style={{ overflowY: 'auto' }}
      >
        {children}
      </Container>
      {onSave && (
        <RouteLeavingGuard when={unSavedChanges} onSave={onSave}>
          <ds-text as="p">
            {t(
              'label.unsaved_changes_line1',
              'Are you sure you want to leave this page without saving?',
            )}
          </ds-text>
          <ds-text as="p">{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</ds-text>
        </RouteLeavingGuard>
      )}
    </Container>
  );
};

export const SettingLayout: FC<{
  description: string;
  children: ReactNode;
  descriptionGap?: boolean;
}> = ({ description, children, descriptionGap }) => (
  <Container crossAlignment="flex-start">
    {children}
    {descriptionGap && <Padding top="small" />}
    <Container height="fit" crossAlignment="flex-start">
      <ds-text as="span" weight="light" color="gray1" size="small" overflow="break-word">
        {description}
      </ds-text>
    </Container>
  </Container>
);
