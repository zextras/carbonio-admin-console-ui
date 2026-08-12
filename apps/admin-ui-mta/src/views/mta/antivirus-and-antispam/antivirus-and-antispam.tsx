/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, ListRow, Padding, Row, SelectItem, useSnackbar } from '@zextras/ui-components';
import { useAllConfig, useCurrentUserRights, useIsAdvanced } from '@zextras/ui-shared';
import { find, isEqual } from 'lodash-es';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MtaAntivirusAndAntispam } from '../../../../types';
import {
  CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
  CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL,
  CONFIG,
  D_DISCARD,
  D_PASS,
  FALSE,
  TRUE,
  ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
  ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY,
  ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
  ZIMBRA_CLAM_AVDATABASE_MIRROR,
  ZIMBRA_SPAM_KILL_PERCENT,
  ZIMBRA_SPAM_SUBJECT_TAG,
  ZIMBRA_SPAM_TAG_PERCENT,
  ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE,
  ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
  ZIMBRA_VIRUS_WARN_ADMIN,
  ZIMBRA_VIRUS_WARN_RECIPIENT,
} from '../../../constants';
import { useModifyConfig } from '../../../services/use-modify-config';
import { isSpaceAvailableInString, isValidHostname } from '../../utility/utils';
import { AntispamSection } from './sections/antispam-section';
import { AntivirusDefinitionsSection } from './sections/antivirus-definitions-section';

type TableRow = { id: string; columns: Array<string | ReactElement> };

function findConfigValue(config: Array<Record<string, string>>, key: string): string | undefined {
  return config.find((item) => item?.n === key)?._content;
}

function findAllConfigValues(config: Array<Record<string, string>>, key: string): Array<string> {
  return config.filter((item) => item?.n === key).map((item) => item?._content);
}

type FormState = {
  initial: MtaAntivirusAndAntispam;
  current: MtaAntivirusAndAntispam;
};

function buildInitialState(configInformation: Array<Record<string, string>>): MtaAntivirusAndAntispam {
  const initialState: Partial<MtaAntivirusAndAntispam> = {};

  const stringKeys = [ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY, ZIMBRA_SPAM_SUBJECT_TAG, ZIMBRA_SPAM_TAG_PERCENT, ZIMBRA_SPAM_KILL_PERCENT, ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY];
  stringKeys.forEach((key) => {
    const val = findConfigValue(configInformation, key);
    if (val) initialState[key as keyof MtaAntivirusAndAntispam] = val as never;
  });

  const boolKeys = [
    { key: ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA, compare: TRUE },
    { key: ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION, compare: TRUE },
    { key: ZIMBRA_VIRUS_WARN_RECIPIENT, compare: TRUE },
    { key: ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE, compare: TRUE },
    { key: ZIMBRA_VIRUS_WARN_ADMIN, compare: TRUE },
    { key: CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK, compare: TRUE },
  ];
  boolKeys.forEach(({ key, compare }) => {
    const val = findConfigValue(configInformation, key);
    if (val) initialState[key as keyof MtaAntivirusAndAntispam] = (val === compare) as never;
  });

  const mirrors = findAllConfigValues(configInformation, ZIMBRA_CLAM_AVDATABASE_MIRROR);
  initialState[ZIMBRA_CLAM_AVDATABASE_MIRROR as keyof MtaAntivirusAndAntispam] = (mirrors.length ? mirrors.join(', ') : '') as never;

  const customUrls = findAllConfigValues(configInformation, CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL);
  initialState[CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL as keyof MtaAntivirusAndAntispam] = (customUrls.length ? customUrls.join(', ') : '') as never;

  return initialState as MtaAntivirusAndAntispam;
}

function MTAAntiVirusAndAntiSpamForm({ configInformation }: { configInformation: Array<Record<string, string>> }) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { mutateAsync: modifyConfigAsync } = useModifyConfig();
  const [formState, setFormState] = useState<FormState>(() => {
    const initialState = buildInitialState(configInformation);
    return { initial: initialState, current: initialState };
  });
  const [selectedAntivirusMirrors, setSelectedAntivirusMirrors] = useState<Array<string>>([]);
  const [antiVirusMirrorsAddText, setAntiVirusMirrorsAddText] = useState('');
  const [selectedAdditionalAntivirusDefinition, setSelectedAdditionalAntivirusDefinition] = useState<Array<string>>([]);
  const [additionalAntiVirusDefinitionAddText, setAdditionalAntiVirusDefinitionAddText] = useState('');
  const isAdvanced = useIsAdvanced();
  const [isShowRemoveAlertDialog, setIsShowRemoveAlertDialog] = useState(false);
  const { data: rights } = useCurrentUserRights();

  const mtaAntiVirusAndAntispamInitialDetail = formState.initial;
  const mtaAntiVirusAndAntispamDetail = formState.current;

  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetMTA = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const isDirty =
    !!mtaAntiVirusAndAntispamDetail && !isEqual(mtaAntiVirusAndAntispamDetail, mtaAntiVirusAndAntispamInitialDetail);

  const intervalOptions = [
    { label: t('mta.seconds', 'Seconds'), value: 's' },
    { label: t('mta.minutes', 'Minutes'), value: 'm' },
    { label: t('mta.hours', 'Hours'), value: 'h' },
    { label: t('mta.days', 'Days'), value: 'd' },
    { label: t('mta.weeks', 'Weeks'), value: 'w' },
  ];

  const freqValue = mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency;
  const updateFrequncy = freqValue?.replace(/\D/g, '') ?? '';
  const updateMesurementUnit =
    intervalOptions.find((item) => item.value === freqValue?.replace(/[^a-zA-Z]/g, '')) ||
    intervalOptions[2];

  const spamTagPercentOptions = [
    { label: t('mta.low', 'Low'), value: '33' },
    { label: t('mta.medium', 'Medium'), value: '20' },
    { label: t('mta.high', 'High'), value: '16' },
  ];

  const spamKillPercentOptions = [
    { label: t('mta.low', 'Low'), value: '90' },
    { label: t('mta.medium', 'Medium'), value: '75' },
    { label: t('mta.high', 'High'), value: '66' },
  ];

  const discardPassOptions = [
    { label: t('mta.discard', 'Discard'), value: D_DISCARD },
    { label: t('mta.pass', 'Pass'), value: D_PASS },
  ];

  const antiVirusMirrorHeader = [{ id: 'antivirus_mirrors', label: t('mta.antivirus_mirrors', 'Antivirus Mirrors'), width: '100%', bold: true }];
  const additionalVirusDefinitionHeader = [{ id: 'additional_virus_definition', label: t('mta.additional_virus_definition', 'Additional Virus Definitions'), width: '100%', bold: true }];

  function setValue(key: string, value: unknown): void {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, [key]: value } as MtaAntivirusAndAntispam,
    }));
  }

  function buildTableRows(
    data: string | undefined,
    setSelected: (items: Array<string>) => void,
    weight: 'bold' | 'light' | 'medium' | 'regular',
  ): Array<TableRow> {
    if (!data) return [];
    return data.split(',').map((item) => ({
      id: item,
      columns: [
        <Container crossAlignment="flex-start" key={item} style={{ cursor: 'pointer' }} onClick={() => setSelected([item])}>
          <ds-text as="span" size="small" weight={weight} key={item} color="gray0">{item}</ds-text>
        </Container>,
      ],
    }));
  }

  const antiVirusMirrorTableRow = buildTableRows(
    mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror,
    setSelectedAntivirusMirrors,
    'regular',
  );

  const additionalAntiVirusDefinitionTableRow = buildTableRows(
    mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL,
    setSelectedAdditionalAntivirusDefinition,
    'light',
  );

  function onAddAntivirusMirrors() {
    if (isSpaceAvailableInString(antiVirusMirrorsAddText)) {
      createSnackbar({ key: 'error', severity: 'error', label: t('mta.space_not_allowed_in_antivirus_mirror', 'Space not allowed in antivirus mirror'), autoHideTimeout: 3000, hideButton: true, replace: true });
      return;
    }
    if (!isValidHostname(antiVirusMirrorsAddText)) {
      createSnackbar({ key: 'error', severity: 'error', label: t('mta.allowed_valid_antivirus_mirror', 'Antivirus mirror is not valid'), autoHideTimeout: 3000, hideButton: true, replace: true });
      return;
    }
    const current = mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror;
    setValue(ZIMBRA_CLAM_AVDATABASE_MIRROR, current ? `${current},${antiVirusMirrorsAddText}` : antiVirusMirrorsAddText);
    setSelectedAntivirusMirrors([]);
    setAntiVirusMirrorsAddText('');
  }

  function onRemoveAntivirusMirrors() {
    const current = mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror;
    if (current) {
      setValue(ZIMBRA_CLAM_AVDATABASE_MIRROR, current.split(',').filter((item) => !selectedAntivirusMirrors.includes(item)).join(','));
    }
    setSelectedAntivirusMirrors([]);
  }

  function onAddAdditionalAntivirusDefinition() {
    if (!additionalAntiVirusDefinitionAddText.startsWith('http')) {
      createSnackbar({ key: 'error', severity: 'error', label: t('mta.additional_virus_definition_start_with_http_https', 'Additional Virus Definition should start with http'), autoHideTimeout: 3000, hideButton: true, replace: true });
      return;
    }
    const current = mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL;
    setValue(CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL, current ? `${current},${additionalAntiVirusDefinitionAddText}` : additionalAntiVirusDefinitionAddText);
    setSelectedAdditionalAntivirusDefinition([]);
    setAdditionalAntiVirusDefinitionAddText('');
  }

  function removeAdditionalAntivirusDefinition() {
    const current = mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL;
    if (current) {
      setValue(CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL, current.split(',').filter((item) => !selectedAdditionalAntivirusDefinition.includes(item)).join(','));
    }
    setSelectedAdditionalAntivirusDefinition([]);
    setIsShowRemoveAlertDialog(false);
  }

  function onRemoveAdditionalAntivirusDefinition() {
    if (isAdvanced) setIsShowRemoveAlertDialog(true);
    else removeAdditionalAntivirusDefinition();
  }

  function onUpdateMesurementChange(v: SelectItem[] | string | null) {
    const opt = intervalOptions.find((item) => item.value === v) || intervalOptions[2];
    setValue(ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY, `${updateFrequncy}${opt.value}`);
  }

  function setUpdateFrequncy(value: string) {
    setValue(ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY, `${value}${updateMesurementUnit.value}`);
  }

  function onCancel() {
    setFormState((prev) => ({ ...prev, current: prev.initial }));
  }

  async function onSave() {
    const d = mtaAntiVirusAndAntispamDetail;
    const attrs: Array<Record<string, string>> = [];

    const pushMulti = (key: string, val: string | undefined) => {
      if (val) val.split(',').forEach((item) => attrs.push({ n: key, _content: item }));
      else if (val === '') attrs.push({ n: key, _content: '' });
    };

    pushMulti(ZIMBRA_CLAM_AVDATABASE_MIRROR, d?.zimbraClamAVDatabaseMirror);
    if (d?.zimbraVirusDefinitionsUpdateFrequency) attrs.push({ n: ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY, _content: d.zimbraVirusDefinitionsUpdateFrequency });
    if (d?.zimbraSpamTagPercent) attrs.push({ n: ZIMBRA_SPAM_TAG_PERCENT, _content: d.zimbraSpamTagPercent });
    if (d?.zimbraSpamSubjectTag) attrs.push({ n: ZIMBRA_SPAM_SUBJECT_TAG, _content: d.zimbraSpamSubjectTag });
    if (d?.zimbraAmavisFinalSpamDestiny) attrs.push({ n: ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY, _content: d.zimbraAmavisFinalSpamDestiny });

    attrs.push({ n: ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA, _content: d?.zimbraAmavisOriginatingBypassSA ? TRUE : FALSE });
    attrs.push({ n: ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION, _content: d?.zimbraAmavisEnableDKIMVerification ? TRUE : FALSE });
    attrs.push({ n: ZIMBRA_VIRUS_WARN_RECIPIENT, _content: d?.zimbraVirusWarnRecipient ? TRUE : FALSE });
    attrs.push({ n: ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE, _content: d?.zimbraVirusBlockEncryptedArchive ? TRUE : FALSE });
    attrs.push({ n: ZIMBRA_VIRUS_WARN_ADMIN, _content: d?.zimbraVirusWarnAdmin ? TRUE : FALSE });

    if (d?.zimbraSpamKillPercent && d?.zimbraAmavisFinalSpamDestiny && d.zimbraAmavisFinalSpamDestiny !== D_PASS) {
      attrs.push({ n: ZIMBRA_SPAM_KILL_PERCENT, _content: d.zimbraSpamKillPercent });
    }

    pushMulti(CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL, d?.carbonioClamAVDatabaseCustomURL);
    attrs.push({ n: CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK, _content: d?.carbonioAmavisDisableVirusCheck ? TRUE : FALSE });

    try {
      await modifyConfigAsync(attrs);
      setFormState((prev) => ({ ...prev, initial: d }));
    } catch {
      // Error snackbar is already shown by the hook
    }
  }

  return (
    <Container background="gray6" mainAlignment="flex-start">
      <Row mainAlignment="flex-start" crossAlignment="center" orientation="horizontal" background="gray6" width="fill" height="3.5rem">
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
            {t('mta.antivirus_and_antispam', 'Antivirus & Antispam')}
          </ds-text>
        </Row>
        <Row>
          {isDirty && (
            <Container orientation="horizontal" mainAlignment="flex-end" crossAlignment="flex-end" background="gray6">
              <Padding right="small">
                <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
              </Padding>
              <Padding right="small">
                <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
              </Padding>
            </Container>
          )}
        </Row>
      </Row>
      <ListRow><ds-divider></ds-divider></ListRow>
      <Container padding={{ all: 'extralarge' }} mainAlignment="flex-start" crossAlignment="flex-start" height="calc(100vh - 10.5rem)" style={{ overflow: 'auto' }}>
        <AntispamSection
          mtaAntiVirusAndAntispamDetail={mtaAntiVirusAndAntispamDetail}
          setValue={setValue}
          allowSetMTA={allowSetMTA}
          spamTagPercentOptions={spamTagPercentOptions}
          spamKillPercentOptions={spamKillPercentOptions}
          discardPassOptions={discardPassOptions}
          onSpamTagPercentChange={(v) => setValue(ZIMBRA_SPAM_TAG_PERCENT, v)}
          onSpamDestinyChange={(v) => setValue(ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY, v)}
          onSpamKillPercentChange={(v) => setValue(ZIMBRA_SPAM_KILL_PERCENT, v)}
        />
        <AntivirusDefinitionsSection
          mtaAntiVirusAndAntispamDetail={mtaAntiVirusAndAntispamDetail}
          setValue={setValue}
          allowSetMTA={allowSetMTA}
          intervalOptions={intervalOptions}
          updateFrequncy={updateFrequncy}
          setUpdateFrequncy={setUpdateFrequncy}
          updateMesurementUnit={updateMesurementUnit}
          onUpdateMesurementChange={onUpdateMesurementChange}
          antiVirusMirrorTableRow={antiVirusMirrorTableRow}
          antiVirusMirrorHeader={antiVirusMirrorHeader}
          selectedAntivirusMirrors={selectedAntivirusMirrors}
          antiVirusMirrorsAddText={antiVirusMirrorsAddText}
          setAntiVirusMirrorsAddText={setAntiVirusMirrorsAddText}
          onAddAntivirusMirrors={onAddAntivirusMirrors}
          onRemoveAntivirusMirrors={onRemoveAntivirusMirrors}
          additionalAntiVirusDefinitionTableRow={additionalAntiVirusDefinitionTableRow}
          additionalVirusDefinitionHeader={additionalVirusDefinitionHeader}
          selectedAdditionalAntivirusDefinition={selectedAdditionalAntivirusDefinition}
          additionalAntiVirusDefinitionAddText={additionalAntiVirusDefinitionAddText}
          setAdditionalAntiVirusDefinitionAddText={setAdditionalAntiVirusDefinitionAddText}
          onAddAdditionalAntivirusDefinition={onAddAdditionalAntivirusDefinition}
          onRemoveAdditionalAntivirusDefinition={onRemoveAdditionalAntivirusDefinition}
          isShowRemoveAlertDialog={isShowRemoveAlertDialog}
          setIsShowRemoveAlertDialog={setIsShowRemoveAlertDialog}
          removeAdditionalAntivirusDefinition={removeAdditionalAntivirusDefinition}
        />
      </Container>
    </Container>
  );
}

export function MTAAntiVirusAndAntiSpam() {
  const { data: configInformation = [] } = useAllConfig();

  if (!configInformation.length) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  return <MTAAntiVirusAndAntiSpamForm key={configInformation.length} configInformation={configInformation} />;
}
