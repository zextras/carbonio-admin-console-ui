/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Select, SelectItem, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaAntivirusAndAntispam } from '../../../../../types';
import {
  D_PASS,
  ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
  ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
  ZIMBRA_SPAM_SUBJECT_TAG,
} from '../../../../constants';

type AntispamSectionProps = Readonly<{
  mtaAntiVirusAndAntispamDetail: MtaAntivirusAndAntispam | undefined;
  setValue: (key: string, value: unknown) => void;
  allowSetMTA: boolean;
  spamTagPercentOptions: Array<SelectItem>;
  spamKillPercentOptions: Array<SelectItem>;
  discardPassOptions: Array<SelectItem>;
  onSpamTagPercentChange: (v: string) => void;
  onSpamDestinyChange: (v: string) => void;
  onSpamKillPercentChange: (v: string) => void;
}>;

export function AntispamSection({
  mtaAntiVirusAndAntispamDetail,
  setValue,
  allowSetMTA,
  spamTagPercentOptions,
  spamKillPercentOptions,
  discardPassOptions,
  onSpamTagPercentChange,
  onSpamDestinyChange,
  onSpamKillPercentChange,
}: AntispamSectionProps) {
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
          <Input
            isRequired
            label={t(
              'mta.add_this_prefix_to_spam_mail_subject',
              'Add this prefix to the Spam mail subject',
            )}
            backgroundColor="gray5"
            value={mtaAntiVirusAndAntispamDetail?.zimbraSpamSubjectTag}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setValue(ZIMBRA_SPAM_SUBJECT_TAG, e.target.value);
            }}
            disabled={!allowSetMTA}
          />
        </Container>
        <Container crossAlignment="flex-start">
          <Select
            items={spamTagPercentOptions}
            background="gray5"
            label={t('mta.tolerance_for_spam_delivery', 'Tolerance for Spam Delivery')}
            showCheckbox={false}
            selection={spamTagPercentOptions.find(
              (item) =>
                item.value === mtaAntiVirusAndAntispamDetail?.zimbraSpamTagPercent,
            )}
            // @ts-expect-error - needs a fix
            onChange={onSpamTagPercentChange}
            disabled={!allowSetMTA}
          />
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
          <Select
            items={discardPassOptions}
            background="gray5"
            label={t('mta.block_spam_destiny', 'Block Spam destiny')}
            showCheckbox={false}
            selection={discardPassOptions.find(
              (item) =>
                item.value === mtaAntiVirusAndAntispamDetail?.zimbraAmavisFinalSpamDestiny,
            )}
            // @ts-expect-error - needs a fix
            onChange={onSpamDestinyChange}
            disabled={!allowSetMTA}
          />
        </Container>
        <Container crossAlignment="flex-start">
          <Select
            items={spamKillPercentOptions}
            background="gray5"
            label={t('mta.tolerance_for_spam_blocking', 'Tolerance for Spam Blocking')}
            showCheckbox={false}
            selection={spamKillPercentOptions.find(
              (item) =>
                item.value === mtaAntiVirusAndAntispamDetail?.zimbraSpamKillPercent,
            )}
            // @ts-expect-error - needs a fix
            onChange={onSpamKillPercentChange}
            disabled={
              mtaAntiVirusAndAntispamDetail?.zimbraAmavisFinalSpamDestiny === D_PASS || !allowSetMTA
            }
          />
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
          <Switch
            label={t('mta.also_check_outbound_messages', 'Also check outbound messages')}
            value={mtaAntiVirusAndAntispamDetail?.zimbraAmavisOriginatingBypassSA}
            onClick={(): void =>
              setValue(
                ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
                !mtaAntiVirusAndAntispamDetail?.zimbraAmavisOriginatingBypassSA,
              )
            }
            disabled={!allowSetMTA}
          />
        </Container>
        <Container crossAlignment="flex-start">
          <Switch
            label={t('mta.verify_dkim_validity', 'Verify DKIM validity')}
            value={mtaAntiVirusAndAntispamDetail?.zimbraAmavisEnableDKIMVerification}
            onClick={(): void =>
              setValue(
                ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
                !mtaAntiVirusAndAntispamDetail?.zimbraAmavisEnableDKIMVerification,
              )
            }
            disabled={!allowSetMTA}
          />
        </Container>
      </Container>
    </>
  );
}
