/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, InheritedSwitch, Padding, Row, useSnackbar } from '@zextras/ui-components';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { SHARES_ENABLED } from '../../../../../constants';
import { useFilesConfigScopeState } from '../../../../../hooks/use-files-config-scope-state';
import { useFilesConfigResolved } from '../../../../../services/use-files-config-resolved';
import { AccountContext } from '../account-context';

/** The InheritedSwitch reads the legacy 'TRUE'/'FALSE' convention; the files admin API uses 'true'/'false'. */
function toSwitchValue(value: string | null | undefined): 'TRUE' | 'FALSE' | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  return value === 'true' ? 'TRUE' : 'FALSE';
}

export function EditAccountFilesSection() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { accountDetail } = useContext(AccountContext);
  const accountId: string | undefined = accountDetail?.zimbraId;

  const { data: resolvedData, isPending } = useFilesConfigResolved(accountId, !!accountId);

  const resolved = resolvedData?.config?.[SHARES_ENABLED];
  const accountOverridden = resolved?.source === 'account';
  const initialOverride = accountOverridden ? resolved?.value ?? undefined : undefined;
  // When the account tier wins we cannot expose the underlying cos>domain>default baseline
  // from the resolved endpoint alone (that would need a resolve-excluding-scope endpoint,
  // flagged in the report). When it does not win, the resolved value IS the baseline.
  const baseline = accountOverridden ? undefined : resolved?.value;

  const state = useFilesConfigScopeState({
    scope: 'account',
    id: accountId,
    key: SHARES_ENABLED,
    initialOverride,
  });

  const displayedIsEnabled = (state.value ?? baseline ?? 'false') === 'true';

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

  if (!accountId || isPending) {
    return <ds-spinner></ds-spinner>;
  }

  return (
    <Container
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
      style={{ overflow: 'auto' }}
    >
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between" crossAlignment="center">
        <ds-text size="small" color="gray0" weight="bold" as="h2">
          {t('files_sharing.title', 'File Sharing')}
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
        <InheritedSwitch
          label={t('files_sharing.shares_enabled', 'Allow users to share files')}
          inputName={SHARES_ENABLED}
          subValue={toSwitchValue(state.value)}
          inheritedValue={toSwitchValue(baseline)}
          fromSubValue={state.hasOverride}
          onChange={() => state.setValue(displayedIsEnabled ? 'false' : 'true')}
          onChangeReset={() => state.clear()}
          iconColor="primary"
        />
      </Row>
      {state.hasOverride && (
        <Row width="100%" padding={{ top: 'small', left: 'large' }} mainAlignment="flex-start">
          <ds-text as="span" size="small" color="secondary">
            {t(
              'files_sharing.account_inherited_hint',
              'The inherited value is applied once the account-level setting is removed.',
            )}
          </ds-text>
        </Row>
      )}
    </Container>
  );
}
