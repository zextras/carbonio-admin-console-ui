/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, PlainInput, PlainSelect, SelectItem, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { D_PASS } from '../../../../constants';
import { MtaAntivirusFormApi } from '../types';

type AntispamSectionProps = Readonly<{
  form: MtaAntivirusFormApi;
  allowSetMTA: boolean;
  spamTagPercentOptions: Array<SelectItem>;
  spamKillPercentOptions: Array<SelectItem>;
  discardPassOptions: Array<SelectItem>;
}>;

export const AntispamSection = ({
  form,
  allowSetMTA,
  spamTagPercentOptions,
  spamKillPercentOptions,
  discardPassOptions,
}: AntispamSectionProps) => {
  const [t] = useTranslation();

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'medium', bottom: 'extralarge' }}
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('label.antispam', 'Antispam')}
        </ds-text>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
          <form.Field name="zimbraSpamSubjectTag">
            {(field) => (
              <PlainInput
                label={t(
                  'mta.add_this_prefix_to_spam_mail_subject',
                  'Add this prefix to the Spam mail subject',
                )}
                value={field.state.value ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraSpamTagPercent">
            {(field) => (
              <PlainSelect
                items={spamTagPercentOptions}
                label={t('mta.tolerance_for_spam_delivery', 'Tolerance for Spam Delivery')}
                selection={spamTagPercentOptions.find((item) => item.value === field.state.value) ?? spamTagPercentOptions[0]}
                onChange={(v: string) => field.handleChange(v)}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
          <form.Field name="zimbraAmavisFinalSpamDestiny">
            {(field) => (
              <PlainSelect
                items={discardPassOptions}
                label={t('mta.block_spam_destiny', 'Block Spam destiny')}
                selection={discardPassOptions.find((item) => item.value === field.state.value) ?? discardPassOptions[0]}
                onChange={(v: string) => field.handleChange(v)}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraSpamKillPercent">
            {(field) => (
              <form.Subscribe selector={(state) => state.values.zimbraAmavisFinalSpamDestiny}>
                {(spamDestiny) => (
                  <PlainSelect
                    items={spamKillPercentOptions}
                    label={t('mta.tolerance_for_spam_blocking', 'Tolerance for Spam Blocking')}
                    selection={spamKillPercentOptions.find((item) => item.value === field.state.value) ?? spamKillPercentOptions[0]}
                    onChange={(v: string) => field.handleChange(v)}
                    disabled={spamDestiny === D_PASS || !allowSetMTA}
                  />
                )}
              </form.Subscribe>
            )}
          </form.Field>
        </Container>
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
          <form.Field name="zimbraAmavisOriginatingBypassSA">
            {(field) => (
              <Switch
                label={t('mta.also_check_outbound_messages', 'Also check outbound messages')}
                value={field.state.value}
                onClick={(): void => field.handleChange(!field.state.value)}
                disabled={!allowSetMTA}
                iconColor="primary"
              />
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraAmavisEnableDKIMVerification">
            {(field) => (
              <Switch
                label={t('mta.verify_dkim_validity', 'Verify DKIM validity')}
                value={field.state.value}
                onClick={(): void => field.handleChange(!field.state.value)}
                disabled={!allowSetMTA}
                iconColor="primary"
              />
            )}
          </form.Field>
        </Container>
      </Container>
    </>
  );
}
