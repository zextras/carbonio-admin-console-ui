/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  Input,
  Modal,
  Padding,
  Row,
} from '@zextras/ui-components';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Composer } from '../../../composer/composer';
import styles from './signature-detail.module.css';

type SignatureEditorDialogProps = {
  /** Signature being edited; `null` for creation. */
  editingSignature: { id: string; name: string; defaultContent: string } | null;
  onCancel: () => void;
  onSave: (name: string, content: string) => void;
};

/**
 * Create/edit signature dialog. Rendered conditionally by the parent, so it
 * mounts fresh (state seeded from `editingSignature`) and resets on close
 * by unmounting.
 */
export const SignatureEditorDialog = ({
  editingSignature,
  onCancel,
  onSave,
}: SignatureEditorDialogProps) => {
  const [t] = useTranslation();
  const [signatureName, setSignatureName] = useState(editingSignature?.name ?? '');
  const [signatureContent, setSignatureContent] = useState(
    editingSignature?.defaultContent ?? '',
  );

  return (
    <Modal
      title={
        editingSignature ? (
          <Trans
            i18nKey="label.edit_signature"
            defaults="<bold>Edit Signature</bold>"
            components={{ bold: <strong /> }}
          />
        ) : (
          <Trans
            i18nKey="label.new_signature"
            defaults="<bold>New Signature</bold>"
            components={{ bold: <strong /> }}
          />
        )
      }
      open
      showCloseIcon
      onClose={onCancel}
      size="large"
      customFooter={
        <Container orientation="horizontal" mainAlignment="space-between">
          <Button
            label={t('label.help', 'Help')}
            type="outlined"
            color="primary"
            onClick={(): null => null}
          />
          <Row mainAlignment="flex-end">
            <Padding all="small">
              <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
            </Padding>
            <Button
              label={t('label.add_to_the_list', 'Add to the list')}
              color="primary"
              disabled={signatureName === '' || signatureContent === ''}
              onClick={(): void => onSave(signatureName, signatureContent)}
            />
          </Row>
        </Container>
      }
    >
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'extralarge', bottom: 'extralarge' }}
      >
        <Container padding={{ bottom: 'medium' }}>
          <Input
            label={t('label.name_of_signature', 'Name of Signature')}
            value={signatureName}
            backgroundColor="gray5"
            onChange={(e: any): any => {
              setSignatureName(e.target.value);
            }}
          />
        </Container>
        <Container>
          <div className={styles.editorWrapper}>
            <Composer
              initialValue={editingSignature?.defaultContent ?? ''}
              value={signatureContent}
              onEditorChange={(ev: any): void => {
                setSignatureContent(ev[1]);
              }}
            />
          </div>
        </Container>
      </Container>
    </Modal>
  );
};
