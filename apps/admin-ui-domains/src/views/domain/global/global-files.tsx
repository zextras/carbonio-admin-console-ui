/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, ListRow, Padding, Row, useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { SHARES_ENABLED } from '../../../constants';
import { useFilesConfigScopeState } from '../../../hooks/use-files-config-scope-state';
import { useFilesConfigDefaults } from '../../../services/use-files-config-defaults';
import { useFilesConfigRaw } from '../../../services/use-files-config-raw';
import { FilesSharingOverrideControl } from '../files-sharing-override-control';

// The global singleton scope has no id; a stable placeholder keeps the query key unique.
const GLOBAL_ID = 'global';

function defaultLabel(value: string | null | undefined, t: (k: string, d: string) => string): string {
  if (value === 'true') {
    return t('files_sharing.state_enabled', 'Enabled');
  }
  if (value === 'false') {
    return t('files_sharing.state_disabled', 'Disabled');
  }
  return t('files_sharing.default_not_configured', 'Not configured');
}

function GlobalFiles() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const { data: rawData, isPending: isRawPending } = useFilesConfigRaw('global', GLOBAL_ID);
  const { data: defaultsData, isPending: isDefaultsPending } = useFilesConfigDefaults();

  const state = useFilesConfigScopeState({
    scope: 'global',
    id: GLOBAL_ID,
    key: SHARES_ENABLED,
    initialOverride: rawData?.overrides?.[SHARES_ENABLED],
  });

  async function handleSave(): Promise<void> {
    const res = await state.save();
    if (res.type === 'success') {
      createSnackbar({
        key: 'files-sharing-success',
        severity: 'success',
        label: t('label.change_save_success_msg', 'The change has been saved successfully'),
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

  if (isRawPending || isDefaultsPending) {
    return <ds-spinner></ds-spinner>;
  }

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      style={{ overflowY: 'auto', position: 'relative' }}
      background="white"
    >
      <Row mainAlignment="flex-start" width="100%" padding={{ all: 'large' }}>
        <Container orientation="vertical" mainAlignment="space-around" height="1.9rem">
          <Row orientation="horizontal" width="100%">
            <Row mainAlignment="flex-start" width="50%" crossAlignment="center">
              <ds-text as="h1" weight="bold">
                {t('files_sharing.title', 'File Sharing')}
              </ds-text>
            </Row>
            <Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
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
        </Container>
      </Row>
      <ds-divider></ds-divider>
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        width="100%"
        padding={{ top: 'extralarge', right: 'large', bottom: 'large', left: 'large' }}
      >
        <Row mainAlignment="flex-start" width="100%" background="gray6" padding={{ bottom: 'small' }}>
          <ds-text as="h2" size="small" weight="bold" color="gray0">
            {t('files_sharing.global_override', 'Global override')}
          </ds-text>
        </Row>
        <ListRow>
          <FilesSharingOverrideControl
            value={state.value}
            onSet={state.setValue}
            onClear={state.clear}
          />
        </ListRow>
        <Row
          mainAlignment="flex-start"
          width="100%"
          background="gray6"
          padding={{ top: 'extralarge', bottom: 'small' }}
        >
          <ds-text as="h2" size="small" weight="bold" color="gray0">
            {t('files_sharing.base_default', 'Base default (read-only)')}
          </ds-text>
        </Row>
        <ListRow>
          <Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto" gap="0.25rem">
            <ds-text as="span" size="medium">
              {`${t('files_sharing.shares_enabled', 'File sharing')}: ${defaultLabel(
                defaultsData?.defaults?.[SHARES_ENABLED],
                t,
              )}`}
            </ds-text>
            <ds-text as="span" size="small" color="secondary">
              {t(
                'files_sharing.base_default_hint',
                'The immutable base default from the service configuration. It is not editable here.',
              )}
            </ds-text>
          </Container>
        </ListRow>
      </Container>
    </Container>
  );
}

export default GlobalFiles;
