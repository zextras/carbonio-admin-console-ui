/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, IconCheckbox, Row, Switch, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type FilesSharingOverrideControlProps = {
  /** The effective value to display: 'true' | 'false' | null. */
  effectiveValue: string | null;
  /** True when the override is set AT this scope (drives the source label and the revert affordance). */
  setAtThisScope: boolean;
  /** Label of this scope, used in the "set here" message (e.g. "Class of Service", "account"). */
  scopeName: string;
  /** Source tier shown when NOT set at this scope; undefined when not yet knowable (pending clear). */
  inheritedSource: 'cos' | 'default' | undefined;
  disabled?: boolean;
  onToggle: () => void;
  onClear: () => void;
};

/**
 * Shows the effective file-sharing value at a scope together with WHERE it comes from
 * (set here / inherited from cos / default), plus a revert affordance when it is set here.
 */
export function FilesSharingOverrideControl({
  effectiveValue,
  setAtThisScope,
  scopeName,
  inheritedSource,
  disabled = false,
  onToggle,
  onClear,
}: FilesSharingOverrideControlProps) {
  const [t] = useTranslation();

  function sourceLabel(): string {
    if (setAtThisScope) {
      return t('files_sharing.source_set_here', 'Set for this {{scope}}', { scope: scopeName });
    }
    if (inheritedSource === 'cos') {
      return t('files_sharing.source_cos', 'Inherited from the Class of Service');
    }
    if (inheritedSource === 'default') {
      return t('files_sharing.source_default', 'Default value');
    }
    return t('files_sharing.source_pending', 'Reverts to the inherited value after saving');
  }

  return (
    <Container mainAlignment="flex-start" crossAlignment="flex-start" gap="0.25rem" height="auto">
      <Row mainAlignment="flex-start" crossAlignment="center" gap="0.5rem">
        <Switch
          value={effectiveValue === 'true'}
          onClick={onToggle}
          label={t('files_sharing.shares_enabled', 'Allow users to share files')}
          iconColor="primary"
          disabled={disabled}
        />
        {setAtThisScope && (
          <Tooltip
            label={t('files_sharing.clear_override', 'Clear the override at this level')}
            placement="top"
          >
            <IconCheckbox
              icon="RefreshOutline"
              value={false}
              onClick={onClear}
              onChange={(): null => null}
              disabled={disabled}
              style={{ cursor: 'pointer' }}
            />
          </Tooltip>
        )}
      </Row>
      <ds-text as="span" size="small" color="secondary">
        {sourceLabel()}
      </ds-text>
    </Container>
  );
}
