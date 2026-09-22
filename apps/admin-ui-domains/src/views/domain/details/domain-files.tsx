/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, InheritedSwitch, ListRow, Padding, Row, useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { SHARES_ENABLED } from '../../../constants';
import { useFilesConfigScopeState } from '../../../hooks/use-files-config-scope-state';
import { useFilesConfigDefaults } from '../../../services/use-files-config-defaults';
import { useFilesConfigRaw } from '../../../services/use-files-config-raw';

/** The InheritedSwitch reads the legacy 'TRUE'/'FALSE' convention; the files admin API uses 'true'/'false'. */
function toSwitchValue(value: string | null | undefined): 'TRUE' | 'FALSE' | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  return value === 'true' ? 'TRUE' : 'FALSE';
}

export function DomainFiles() {
  const [t] = useTranslation();
  const { domainId } = useParams();
  const createSnackbar = useSnackbar();

  const { data: rawData, isPending: isRawPending } = useFilesConfigRaw(
    'domain',
    domainId,
    !!domainId,
  );
  const { data: defaultsData, isPending: isDefaultsPending } = useFilesConfigDefaults();

  const initialOverride = rawData?.overrides?.[SHARES_ENABLED];
  const baseline = defaultsData?.defaults?.[SHARES_ENABLED];

  const state = useFilesConfigScopeState({
    scope: 'domain',
    id: domainId,
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

  if ((!!domainId && isRawPending) || isDefaultsPending) {
    return <ds-spinner />;
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
        <ListRow>
          <Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
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
          </Container>
        </ListRow>
      </Container>
    </Container>
  );
}
