/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  Input,
  ListRow,
  Padding,
  Row,
  useSnackbar,
} from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useCreateSignature,
  useDeleteSignature,
  useModifySignature,
} from '../../../services/use-signature-mutations';
import { SignatureEditorDialog } from './signature-editor-dialog';
import { SignatureTable } from './signature-table';
import { filterSignatures, type Signature } from './utils';

/** Funnel icon shown in the signature search box. */
const SearchFunnelIcon = (): React.ReactElement => (
	<ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
);

type SignatureDetailProps = {
  isEditable: boolean;
  /** Server truth (React Query data via the account form context). */
  signatureList: Array<Signature>;
  accountId?: string;
  hideSearchBar?: boolean;
};

type EditingSignature = { id: string; name: string; defaultContent: string };

/**
 * Signature management: toolbar, search, list and create/edit dialog. All
 * mutations go through tested React Query hooks; the list refreshes through
 * query invalidation (`accountSignatures`).
 */
export const SignatureDetail = ({
  isEditable,
  signatureList,
  accountId,
  hideSearchBar,
}: SignatureDetailProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [selectedSignature, setSelectedSignature] = useState<Array<string>>([]);
  const [searchSignatureName, setSearchSignatureName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState<EditingSignature | null>(null);

  const createMutation = useCreateSignature(accountId ?? '');
  const modifyMutation = useModifySignature(accountId ?? '');
  const deleteMutation = useDeleteSignature(accountId ?? '');

  const visibleSignatures = filterSignatures(signatureList, searchSignatureName);

  const showErrorSnackbar = (): void => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  const handleDialogCancel = (): void => {
    setIsDialogOpen(false);
  };

  const handleDialogSave = (name: string, content: string): void => {
    if (!accountId) {
      setIsDialogOpen(false);
      return;
    }
    const closeDialog = (): void => setIsDialogOpen(false);
    if (editingSignature) {
      modifyMutation.mutate(
        { signatureId: editingSignature.id, name, content },
        { onSuccess: closeDialog, onError: showErrorSnackbar },
      );
    } else {
      createMutation.mutate({ name, content }, { onSuccess: closeDialog, onError: showErrorSnackbar });
    }
  };

  const handleEditClick = (): void => {
    const signature = signatureList.find((item) => item?.id === selectedSignature[0]);
    if (signature?.id) {
      setEditingSignature({
        id: signature.id,
        name: signature.name,
        defaultContent: signature.content?.[0]?._content ?? '',
      });
      setIsDialogOpen(true);
    }
  };

  const handleDeleteClick = (): void => {
    if (!accountId) {
      setSelectedSignature([]);
      return;
    }
    deleteMutation.mutate(
      { signatureIds: selectedSignature },
      {
        onSuccess: (): void => setSelectedSignature([]),
        onError: showErrorSnackbar,
      },
    );
  };

  return (
    <>
      {isEditable && (
        <ListRow>
          <Row mainAlignment="flex-end" width="100%" wrap="nowrap" padding={{ top: 'large' }}>
            <Padding all={'0'}>
              <Button
                type="outlined"
                label={t('label.add', 'Add')}
                icon="Plus"
                color="primary"
                onClick={(): void => {
                  setEditingSignature(null);
                  setIsDialogOpen(true);
                }}
              />
            </Padding>
            <Padding left="large">
              <Button
                type="outlined"
                label={t('label.edit', 'Edit')}
                icon="Edit"
                color="secondary"
                disabled={selectedSignature.length === 0 || selectedSignature.length > 1}
                onClick={handleEditClick}
              />
            </Padding>
            <Padding left="large">
              <Button
                type="outlined"
                label={t('label.delete', 'Delete')}
                icon="Trash2Outline"
                color="error"
                disabled={selectedSignature.length === 0}
                onClick={handleDeleteClick}
              />
            </Padding>
          </Row>
        </ListRow>
      )}
      {!hideSearchBar && (
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <Row width="100%">
              <Input
                disabled={visibleSignatures.length === 0 && searchSignatureName.length === 0}
                label={t('label.search_a_signature', 'Search for a signature')}
                backgroundColor="gray5"
                value={searchSignatureName}
                CustomIcon={SearchFunnelIcon}
                onChange={(e: any): any => {
                  setSearchSignatureName(e.target.value);
                }}
              />
            </Row>
          </Container>
        </ListRow>
      )}
      <SignatureTable
        signatureList={visibleSignatures}
        selectedSignature={selectedSignature}
        onSelectionChange={setSelectedSignature}
      />
      {isDialogOpen && (
        <SignatureEditorDialog
          key={editingSignature?.id ?? 'create'}
          editingSignature={editingSignature}
          onCancel={handleDialogCancel}
          onSave={handleDialogSave}
        />
      )}
    </>
  );
};
