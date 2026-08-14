/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, ChipInput, Container, Switch, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CustomChip } from '../../../components/customChip';
import { MtaInboundFormApi } from '../types';

type SettingsSectionProps = {
  form: MtaInboundFormApi;
  mtaBlockExtension: Array<Record<string, string>>;
  allowSetMTA: boolean;
  onBlockExtensionChange: (ev: Array<{ label?: string }>) => void;
  onCommonBlockExtensionAdd: () => void;
};

export function SettingsSection({
  form,
  mtaBlockExtension,
  allowSetMTA,
  onBlockExtensionChange,
  onCommonBlockExtensionAdd,
}: Readonly<SettingsSectionProps>) {
  const [t] = useTranslation();

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'large', bottom: 'extralarge' }}
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('mta.settings', 'Settings')}
        </ds-text>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ top: 'large', bottom: 'extralarge' }}
        height="auto"
      >
        <Container
          crossAlignment="flex-start"
          width="70%"
          padding={{ right: 'medium' }}
          style={allowSetMTA ? {} : { pointerEvents: 'none', cursor: 'pointer' }}
        >
          <ChipInput
            placeholder={t('mta.add_here_any_blocked_extension', 'Add here any Blocked Extension')}
            background="gray5"
            requireUniqueChips
            value={mtaBlockExtension}
            onChange={onBlockExtensionChange}
            disabled={!allowSetMTA}
            ChipComponent={CustomChip}
            maxChips={null}
          />
        </Container>
        <Container crossAlignment="flex-start" width="30%">
          <Button
            label={t('mta.add_commonly_blocked_extensions', 'Add commonly blocked extensions')}
            color="primary"
            size="medium"
            type="outlined"
            onClick={onCommonBlockExtensionAdd}
            disabled={!allowSetMTA}
          />
        </Container>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ top: 'large', bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraMtaBlockedExtensionWarnAdmin">
            {(field) => (
              <Tooltip
                placement="bottom"
                label={t(
                  'mta.notify_administrators_of_blocked_file_extension_incoming_emails',
                  'Notify administrators about blocked file extensions in incoming emails',
                )}
                maxWidth="auto"
              >
                <Switch
                  label={t(
                    'mta.notify_admins_about_block_extensions',
                    'Notify admins about blocked extensions',
                  )}
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start" height="auto">
          <form.Field name="zimbraMtaBlockedExtensionWarnRecipient">
            {(field) => (
              <Tooltip
                placement="bottom"
                label={t(
                  'mta.notify_recipients_of_blocked_file_extension_incoming_emails',
                  'Notify recipients about blocked file extensions in incoming emails',
                )}
                maxWidth="auto"
              >
                <Switch
                  label={t(
                    'mta.notify_external_recipient_about_block_extensions',
                    'Notify external recipients about blocked extensions',
                  )}
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
        </Container>
      </Container>
    </>
  );
}
