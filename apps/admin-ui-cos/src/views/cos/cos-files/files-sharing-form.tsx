/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, FormPageLayout, useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { SHARES_ENABLED } from '../../../constants';
import { FilesSharingOverrideControl } from './files-sharing-override-control';
import { useFilesConfigScopeState } from './use-files-config-scope-state';

type FilesSharingFormProps = {
  zimbraId: string | undefined;
  /** The value overridden at the cos scope on the server, or undefined when not overridden. */
  initialOverride: string | undefined;
  /** The base default (source `default`), the fallback shown when nothing is set at the cos scope. */
  baseline: string | null | undefined;
};

export function FilesSharingForm({ zimbraId, initialOverride, baseline }: FilesSharingFormProps) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const state = useFilesConfigScopeState({
    scope: 'cos',
    id: zimbraId,
    key: SHARES_ENABLED,
    initialOverride,
  });

  const effectiveValue = state.hasOverride ? (state.value ?? null) : baseline ?? null;

  async function handleSave(): Promise<void> {
    const res = await state.save();
    if (res.type === 'success') {
      createSnackbar({
        key: 'files-sharing-success',
        severity: 'success',
        label: t(
          'label.the_last_changes_has_been_saved_successfully',
          'Changes have been saved successfully',
        ),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    } else if (res.type === 'error') {
      createSnackbar({
        key: 'files-sharing-error',
        severity: 'error',
        label: res.error || t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  }

  return (
    <FormPageLayout
      title={t('files_sharing.title', 'File Sharing')}
      onSave={handleSave}
      onCancel={() => state.reset()}
      unsavedChanges={state.isDirty}
    >
      <Container mainAlignment="flex-start" crossAlignment="flex-start" width="100%" height="auto">
        <FilesSharingOverrideControl
          effectiveValue={effectiveValue}
          setAtThisScope={state.hasOverride}
          scopeName={t('label.class_of_service_lower', 'Class of Service')}
          inheritedSource="default"
          onToggle={() => state.setValue(effectiveValue === 'true' ? 'false' : 'true')}
          onClear={() => state.clear()}
        />
      </Container>
    </FormPageLayout>
  );
}
