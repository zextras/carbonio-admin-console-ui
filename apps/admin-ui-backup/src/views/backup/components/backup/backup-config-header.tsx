/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Padding, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type BackupConfigHeaderProps = {
  title: string;
  isDirty: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export const BackupConfigHeader = ({
  title,
  isDirty,
  onCancel,
  onSave,
}: BackupConfigHeaderProps) => {
  const [t] = useTranslation();
  return (
    <Row mainAlignment="flex-start" width="100%">
      <Container orientation="vertical" mainAlignment="space-around" height="3.5rem">
        <Row orientation="horizontal" width="100%">
          <Row
            padding={{ all: 'large' }}
            mainAlignment="flex-start"
            width="50%"
            crossAlignment="center"
          >
            <ds-text as="h2" size="medium" weight="bold" color="gray0">
              {title}
            </ds-text>
          </Row>
          <Row
            padding={{ all: 'large' }}
            width="50%"
            mainAlignment="flex-end"
            crossAlignment="center"
          >
            <Padding right="small">
              {isDirty && (
                <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
              )}
            </Padding>
            {isDirty && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
          </Row>
        </Row>
      </Container>
      <ds-divider></ds-divider>
    </Row>
  );
};
