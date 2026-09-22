/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Select } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

const UNSET = 'unset';

type FilesSharingOverrideControlProps = {
  /** The raw override value at this scope: 'true' | 'false', or undefined when nothing is set here. */
  value: string | undefined;
  onSet: (value: string) => void;
  onClear: () => void;
};

/**
 * Honest tri-state editor for a single RAW boolean override at ONE scope:
 * "Not set at this level" / "Enabled" / "Disabled". It never shows an inherited/resolved
 * value — for a scope entity in isolation the substitute value is not knowable.
 */
export function FilesSharingOverrideControl({
  value,
  onSet,
  onClear,
}: FilesSharingOverrideControlProps) {
  const [t] = useTranslation();

  const items = [
    { value: UNSET, label: t('files_sharing.state_unset', 'Not set at this level') },
    { value: 'true', label: t('files_sharing.state_enabled', 'Enabled') },
    { value: 'false', label: t('files_sharing.state_disabled', 'Disabled') },
  ];
  const current = value === undefined ? UNSET : value;
  const selection = items.find((item) => item.value === current) ?? items[0];

  return (
    <Container mainAlignment="flex-start" crossAlignment="flex-start" gap="0.5rem" height="auto">
      <Select
        items={items}
        selection={selection}
        label={t('files_sharing.shares_enabled', 'File sharing')}
        background="gray5"
        showCheckbox={false}
        onChange={(selected: string | null): void => {
          if (selected === null || selected === UNSET) {
            onClear();
          } else {
            onSet(selected);
          }
        }}
      />
      {value === undefined && (
        <ds-text as="span" size="small" color="secondary">
          {t(
            'files_sharing.not_set_hint',
            'No override is set at this level. The effective value depends on the account and is not shown here.',
          )}
        </ds-text>
      )}
    </Container>
  );
}
