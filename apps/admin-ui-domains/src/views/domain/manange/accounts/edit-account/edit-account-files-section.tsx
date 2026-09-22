/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Padding, Row, useSnackbar } from '@zextras/ui-components';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { SHARES_ENABLED } from '../../../../../constants';
import { useFilesConfigScopeState } from '../../../../../hooks/use-files-config-scope-state';
import { useFilesConfigRaw } from '../../../../../services/use-files-config-raw';
import { FilesSharingOverrideControl } from '../../../files-sharing-override-control';
import { AccountContext } from '../account-context';

export function EditAccountFilesSection() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { accountDetail } = useContext(AccountContext);
  const accountId: string | undefined = accountDetail?.zimbraId;

  const { data: rawData, isPending } = useFilesConfigRaw('account', accountId, !!accountId);

  const state = useFilesConfigScopeState({
    scope: 'account',
    id: accountId,
    key: SHARES_ENABLED,
    initialOverride: rawData?.overrides?.[SHARES_ENABLED],
  });

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
      <Row
        padding={{ top: 'large' }}
        width="100%"
        mainAlignment="space-between"
        crossAlignment="center"
      >
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
        <FilesSharingOverrideControl
          value={state.value}
          onSet={state.setValue}
          onClear={state.clear}
        />
      </Row>
    </Container>
  );
}
