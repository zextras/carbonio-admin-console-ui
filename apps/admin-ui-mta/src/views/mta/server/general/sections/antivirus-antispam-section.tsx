/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, InheritedSwitch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaServerGeneral } from '../../../../../../types';
import {
  CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
  ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
  ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
} from '../../../../../constants';

type AntivirusAntispamSectionProps = Readonly<{
  mtaServerGeneralDetail: MtaServerGeneral | undefined;
  mtaServerSpecificGeneralDetail: MtaServerGeneral | undefined;
  configInformation: Array<{ n: string; _content: string }>;
  allowSetMTA: boolean;
  changeSwitchOption: (key: keyof MtaServerGeneral) => void;
  setEmptyValue: (keyName: keyof MtaServerGeneral) => void;
}>;

export function AntivirusAntispamSection({
  mtaServerGeneralDetail,
  mtaServerSpecificGeneralDetail,
  configInformation,
  allowSetMTA,
  changeSwitchOption,
  setEmptyValue,
}: AntivirusAntispamSectionProps) {
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
          {t('mta.antispam_and_antivirus', 'Antispam & Antivirus')}
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
          <InheritedSwitch
            subValue={mtaServerGeneralDetail?.zimbraAmavisOriginatingBypassSA}
            onChange={changeSwitchOption}
            label={t('mta.also_check_outbound_messages', 'Also check outbound messages')}
            iconColor="primary"
            inheritedValue={
              configInformation?.find(
                (item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
              )?._content
            }
            fromSubValue={mtaServerSpecificGeneralDetail?.zimbraAmavisOriginatingBypassSA}
            inputName={ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA}
            onChangeReset={(): void => setEmptyValue(ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA)}
            disabled={!allowSetMTA}
          />
        </Container>
        <Container crossAlignment="flex-start">
          <InheritedSwitch
            subValue={mtaServerGeneralDetail?.zimbraAmavisEnableDKIMVerification}
            onChange={changeSwitchOption}
            label={t('mta.verify_dkim_validity', 'Verify DKIM validity')}
            iconColor="primary"
            inheritedValue={
              configInformation?.find(
                (item: Record<string, string>) =>
                  item?.n === ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
              )?._content
            }
            fromSubValue={mtaServerSpecificGeneralDetail?.zimbraAmavisEnableDKIMVerification}
            inputName={ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION}
            onChangeReset={(): void => setEmptyValue(ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION)}
            disabled={!allowSetMTA}
          />
        </Container>
        <Container crossAlignment="flex-start">
          <InheritedSwitch
            subValue={mtaServerGeneralDetail?.carbonioAmavisDisableVirusCheck}
            onChange={changeSwitchOption}
            label={t('mta.disable_virus_check', 'Disable Virus Check')}
            iconColor="primary"
            inheritedValue={
              configInformation?.find(
                (item: Record<string, string>) => item?.n === CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
              )?._content
            }
            fromSubValue={mtaServerSpecificGeneralDetail?.carbonioAmavisDisableVirusCheck}
            inputName={CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK}
            onChangeReset={(): void => setEmptyValue(CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK)}
            disabled={!allowSetMTA}
          />
        </Container>
      </Container>
    </>
  );
}
