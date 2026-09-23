/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Padding, Row, useSnackbar } from '@zextras/ui-components';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { SHARES_ENABLED } from '../../../../../constants';
import { useFilesConfigScopeState } from '../../../../../hooks/use-files-config-scope-state';
import { useFilesConfigRaw } from '../../../../../services/use-files-config-raw';
import { useFilesConfigResolved } from '../../../../../services/use-files-config-resolved';
import { FilesSharingOverrideControl } from '../../../files-sharing-override-control';
import { AccountContext } from '../account-context';

export function EditAccountFilesSection() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { accountDetail } = useContext(AccountContext);
  const accountId: string | undefined = accountDetail?.zimbraId;

  const { data: resolvedData, isPending: isResolvedPending } = useFilesConfigResolved(
    accountId,
    !!accountId,
  );
  const { data: rawData, isPending: isRawPending } = useFilesConfigRaw(
    'account',
    accountId,
    !!accountId,
  );

  const state = useFilesConfigScopeState({
    scope: 'account',
    id: accountId,
    key: SHARES_ENABLED,
    initialOverride: rawData?.overrides?.[SHARES_ENABLED],
  });

  const resolved = resolvedData?.config?.[SHARES_ENABLED];
  const serverSource = resolved?.source;
  // When the account does not win, the resolved value/source IS the inherited baseline.
  // When it wins, the underlying cos/default baseline is not exposed by this endpoint, so it
  // is only known again after clearing + refetching (the pre-clear preview is intentionally
  // not attempted; the requirement is to show the current effective value + source).
  const inheritedSource: 'cos' | 'default' | undefined =
    serverSource === 'cos' || serverSource === 'default' ? serverSource : undefined;
  const inheritedValue = inheritedSource ? resolved?.value ?? null : null;

  const editorDisabled = !state.hasOverride && inheritedSource === undefined;
  const effectiveValue = state.hasOverride ? state.value ?? null : inheritedValue;

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

  if (!accountId || isResolvedPending || isRawPending) {
    return <ds-spinner></ds-spinner>;
  }

  return (
    <>
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      <Row
        padding={{ top: 'large' }}
        width="100%"
        mainAlignment="space-between"
        crossAlignment="center"
      >
        <ds-text size="small" color="gray0" weight="bold" as="h2">
          {t('label.files', 'Files')}
        </ds-text>
        <Row mainAlignment="flex-end">
          <Padding right="small">
            {state.isDirty && (
              <Button
                label={t('label.cancel', 'Cancel')}
                color="secondary"
                onClick={() => state.reset()}
              />
            )}
          </Padding>
          {state.isDirty && (
            <Button label={t('label.save', 'Save')} color="primary" onClick={handleSave} />
          )}
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="flex-start">
        <FilesSharingOverrideControl
          effectiveValue={effectiveValue}
          setAtThisScope={state.hasOverride}
          scopeName={t('label.account_lower', 'account')}
          inheritedSource={inheritedSource}
          disabled={editorDisabled}
          onToggle={() => state.setValue(effectiveValue === 'true' ? 'false' : 'true')}
          onClear={() => state.clear()}
        />
      </Row>
    </>
  );
}
