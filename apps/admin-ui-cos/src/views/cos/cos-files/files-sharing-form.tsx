/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, FormPageLayout, InheritedSwitch, useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { SHARES_ENABLED } from '../../../constants';
import { useFilesConfigScopeState } from './use-files-config-scope-state';

/** The InheritedSwitch reads the legacy 'TRUE'/'FALSE' convention; the files admin API uses 'true'/'false'. */
function toSwitchValue(value: string | null | undefined): 'TRUE' | 'FALSE' | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  return value === 'true' ? 'TRUE' : 'FALSE';
}

type FilesSharingFormProps = {
  zimbraId: string | undefined;
  /** The value overridden at the cos scope on the server, or undefined when not overridden. */
  initialOverride: string | undefined;
  /** The base default (inherited baseline) for the cos scope. */
  baseline: string | null | undefined;
  readonlyCOS: boolean;
};

export function FilesSharingForm({
  zimbraId,
  initialOverride,
  baseline,
  readonlyCOS,
}: FilesSharingFormProps) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const state = useFilesConfigScopeState({
    scope: 'cos',
    id: zimbraId,
    key: SHARES_ENABLED,
    initialOverride,
  });

  const displayedIsEnabled = (state.value ?? baseline ?? 'false') === 'true';

  function onToggle(): void {
    state.setValue(displayedIsEnabled ? 'false' : 'true');
  }

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
        <InheritedSwitch
          label={t('files_sharing.shares_enabled', 'Allow users to share files')}
          inputName={SHARES_ENABLED}
          subValue={toSwitchValue(state.value)}
          inheritedValue={toSwitchValue(baseline)}
          fromSubValue={state.hasOverride}
          onChange={onToggle}
          onChangeReset={() => state.clear()}
          iconColor="primary"
          disabled={readonlyCOS}
        />
      </Container>
    </FormPageLayout>
  );
}
