/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, InheritedSwitch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import {
  CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
  FALSE,
  TRUE,
  ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
  ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
} from '../../../../../constants';
import {
  ConfigItem,
  MtaServerGeneralFormApi,
  MtaServerGeneralFormValues,
} from '../types';

type AntivirusAntispamSectionProps = Readonly<{
  form: MtaServerGeneralFormApi;
  mtaServerSpecificGeneralDetail: MtaServerGeneralFormValues | undefined;
  configInformation: Array<ConfigItem>;
  allowSetMTA: boolean;
}>;

export const AntivirusAntispamSection = ({
  form,
  mtaServerSpecificGeneralDetail,
  configInformation,
  allowSetMTA,
}: AntivirusAntispamSectionProps) => {
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
          <form.Field name="zimbraAmavisOriginatingBypassSA">
            {(field) => (
              <InheritedSwitch
                subValue={field.state.value}
                onChange={() =>
                  field.handleChange(field.state.value === TRUE ? FALSE : TRUE)
                }
                label={t('mta.also_check_outbound_messages', 'Also check outbound messages')}
                iconColor="primary"
                inheritedValue={
                  configInformation?.find(
                    (item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
                  )?._content
                }
                fromSubValue={mtaServerSpecificGeneralDetail?.zimbraAmavisOriginatingBypassSA}
                inputName={ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA}
                onChangeReset={() => field.handleChange(undefined)}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraAmavisEnableDKIMVerification">
            {(field) => (
              <InheritedSwitch
                subValue={field.state.value}
                onChange={() =>
                  field.handleChange(field.state.value === TRUE ? FALSE : TRUE)
                }
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
                onChangeReset={() => field.handleChange(undefined)}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="carbonioAmavisDisableVirusCheck">
            {(field) => (
              <InheritedSwitch
                subValue={field.state.value}
                onChange={() =>
                  field.handleChange(field.state.value === TRUE ? FALSE : TRUE)
                }
                label={t('mta.disable_virus_check', 'Disable Virus Check')}
                iconColor="primary"
                inheritedValue={
                  configInformation?.find(
                    (item: Record<string, string>) => item?.n === CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
                  )?._content
                }
                fromSubValue={mtaServerSpecificGeneralDetail?.carbonioAmavisDisableVirusCheck}
                inputName={CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK}
                onChangeReset={() => field.handleChange(undefined)}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
      </Container>
    </>
  );
}
