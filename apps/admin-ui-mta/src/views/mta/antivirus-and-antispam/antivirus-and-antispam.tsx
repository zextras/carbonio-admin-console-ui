/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Container, FormPageLayout, SelectItem, useSnackbar } from '@zextras/ui-components';
import { useAllConfig, useCurrentUserRights, useIsAdvanced } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { ReactElement, useRef, useState } from 'react';
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

function buildInitialState(
  configInformation: Array<Record<string, string>>,
): MtaAntivirusAndAntispam {
  const mirrors = findAllConfigValues(configInformation, ZIMBRA_CLAM_AVDATABASE_MIRROR);
  const customUrls = findAllConfigValues(configInformation, CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL);

  return {
    zimbraAmavisFinalSpamDestiny:
      findConfigValue(configInformation, ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY) ?? '',
    zimbraSpamSubjectTag: findConfigValue(configInformation, ZIMBRA_SPAM_SUBJECT_TAG) ?? '',
    zimbraSpamTagPercent: findConfigValue(configInformation, ZIMBRA_SPAM_TAG_PERCENT) ?? '',
    zimbraSpamKillPercent: findConfigValue(configInformation, ZIMBRA_SPAM_KILL_PERCENT) ?? '',
    zimbraVirusDefinitionsUpdateFrequency:
      findConfigValue(configInformation, ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY) ?? '',
    zimbraAmavisOriginatingBypassSA:
      findConfigValue(configInformation, ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA) === TRUE,
    zimbraAmavisEnableDKIMVerification:
      findConfigValue(configInformation, ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION) === TRUE,
    zimbraVirusWarnRecipient:
      findConfigValue(configInformation, ZIMBRA_VIRUS_WARN_RECIPIENT) === TRUE,
    zimbraVirusBlockEncryptedArchive:
      findConfigValue(configInformation, ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE) === TRUE,
    zimbraVirusWarnAdmin: findConfigValue(configInformation, ZIMBRA_VIRUS_WARN_ADMIN) === TRUE,
    carbonioAmavisDisableVirusCheck:
      findConfigValue(configInformation, CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK) === TRUE,
    zimbraClamAVDatabaseMirror: mirrors.length ? mirrors.join(', ') : '',
    carbonioClamAVDatabaseCustomURL: customUrls.length ? customUrls.join(', ') : '',
  };
}

type MTAAntiVirusAndAntiSpamFormProps = Readonly<{
  configInformation: Array<Record<string, string>>;
}>;

const MTAAntiVirusAndAntiSpamForm = ({ configInformation }: MTAAntiVirusAndAntiSpamFormProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { mutateAsync: modifyConfigAsync } = useModifyConfig();
  const { data: rights } = useCurrentUserRights();
  const isAdvanced = useIsAdvanced();

  const [selectedAntivirusMirrors, setSelectedAntivirusMirrors] = useState<Array<string>>([]);
  const [antiVirusMirrorsAddText, setAntiVirusMirrorsAddText] = useState('');
  const [selectedAdditionalAntivirusDefinition, setSelectedAdditionalAntivirusDefinition] =
    useState<Array<string>>([]);
  const [additionalAntiVirusDefinitionAddText, setAdditionalAntiVirusDefinitionAddText] =
    useState('');
  const [isShowRemoveAlertDialog, setIsShowRemoveAlertDialog] = useState(false);
  const saveInFlightRef = useRef(false);

  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetMTA = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const form = useForm({
    defaultValues: buildInitialState(configInformation),
    onSubmit: async ({ value }) => {
      const attrs: Array<Record<string, string>> = [];

      const pushMulti = (key: string, val: string | undefined) => {
        if (val) val.split(',').forEach((item) => attrs.push({ n: key, _content: item.trim() }));
        else if (val === '') attrs.push({ n: key, _content: '' });
      };

      pushMulti(ZIMBRA_CLAM_AVDATABASE_MIRROR, value.zimbraClamAVDatabaseMirror);
      if (value.zimbraVirusDefinitionsUpdateFrequency)
        attrs.push({
          n: ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
          _content: value.zimbraVirusDefinitionsUpdateFrequency,
        });
      if (value.zimbraSpamTagPercent)
        attrs.push({ n: ZIMBRA_SPAM_TAG_PERCENT, _content: value.zimbraSpamTagPercent });
      if (value.zimbraSpamSubjectTag)
        attrs.push({ n: ZIMBRA_SPAM_SUBJECT_TAG, _content: value.zimbraSpamSubjectTag });
      if (value.zimbraAmavisFinalSpamDestiny)
        attrs.push({
          n: ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY,
          _content: value.zimbraAmavisFinalSpamDestiny,
        });

      attrs.push(
        {
          n: ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
          _content: value.zimbraAmavisOriginatingBypassSA ? TRUE : FALSE,
        },
        {
          n: ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
          _content: value.zimbraAmavisEnableDKIMVerification ? TRUE : FALSE,
        },
        { n: ZIMBRA_VIRUS_WARN_RECIPIENT, _content: value.zimbraVirusWarnRecipient ? TRUE : FALSE },
        {
          n: ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE,
          _content: value.zimbraVirusBlockEncryptedArchive ? TRUE : FALSE,
        },
        { n: ZIMBRA_VIRUS_WARN_ADMIN, _content: value.zimbraVirusWarnAdmin ? TRUE : FALSE },
      );

      if (
        value.zimbraSpamKillPercent &&
        value.zimbraAmavisFinalSpamDestiny &&
        value.zimbraAmavisFinalSpamDestiny !== D_PASS
      ) {
        attrs.push({ n: ZIMBRA_SPAM_KILL_PERCENT, _content: value.zimbraSpamKillPercent });
      }

      pushMulti(CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL, value.carbonioClamAVDatabaseCustomURL);
      attrs.push({
        n: CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
        _content: value.carbonioAmavisDisableVirusCheck ? TRUE : FALSE,
      });

      try {
        await modifyConfigAsync(attrs);
        form.reset(value, { keepDefaultValues: true });
      } catch {
        // Error snackbar is already shown by the hook
      }
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  const intervalOptions = [
    { label: t('mta.seconds', 'Seconds'), value: 's' },
    { label: t('mta.minutes', 'Minutes'), value: 'm' },
    { label: t('mta.hours', 'Hours'), value: 'h' },
    { label: t('mta.days', 'Days'), value: 'd' },
    { label: t('mta.weeks', 'Weeks'), value: 'w' },
  ];

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

  const antiVirusMirrorHeader = [
    {
      id: 'antivirus_mirrors',
      label: t('mta.antivirus_mirrors', 'Antivirus Mirrors'),
      width: '100%',
      bold: true,
    },
  ];
  const additionalVirusDefinitionHeader = [
    {
      id: 'additional_virus_definition',
      label: t('mta.additional_virus_definition', 'Additional Virus Definitions'),
      width: '100%',
      bold: true,
    },
  ];

  function buildTableRows(
    data: string | undefined,
    setSelected: (items: Array<string>) => void,
    weight: 'bold' | 'light' | 'medium' | 'regular',
  ): Array<TableRow> {
    if (!data) return [];
    return data
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({
        id: item,
        columns: [
          <Container
            crossAlignment="flex-start"
            key={item}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelected([item])}
          >
            <ds-text as="span" size="small" weight={weight} key={item} color="gray0">
              {item}
            </ds-text>
          </Container>,
        ],
      }));
  }

  const currentMirrors = useSelector(
    form.store,
    (state) => state.values.zimbraClamAVDatabaseMirror,
  );
  const currentCustomUrls = useSelector(
    form.store,
    (state) => state.values.carbonioClamAVDatabaseCustomURL,
  );
  const freqValue = useSelector(
    form.store,
    (state) => state.values.zimbraVirusDefinitionsUpdateFrequency,
  );

  const updateFrequncy = freqValue?.replaceAll(/\D/g, '') ?? '';
  const updateMesurementUnit =
    intervalOptions.find((item) => item.value === freqValue?.replaceAll(/[^a-zA-Z]/g, '')) ||
    intervalOptions[2];

  const antiVirusMirrorTableRow = buildTableRows(
    currentMirrors,
    setSelectedAntivirusMirrors,
    'regular',
  );

  const additionalAntiVirusDefinitionTableRow = buildTableRows(
    currentCustomUrls,
    setSelectedAdditionalAntivirusDefinition,
    'light',
  );

  function onAddAntivirusMirrors() {
    if (isSpaceAvailableInString(antiVirusMirrorsAddText)) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: t(
          'mta.space_not_allowed_in_antivirus_mirror',
          'Space not allowed in antivirus mirror',
        ),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      return;
    }
    if (!isValidHostname(antiVirusMirrorsAddText)) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: t('mta.allowed_valid_antivirus_mirror', 'Antivirus mirror is not valid'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      return;
    }
    const current = currentMirrors;
    form.setFieldValue(
      'zimbraClamAVDatabaseMirror',
      current ? `${current}, ${antiVirusMirrorsAddText}` : antiVirusMirrorsAddText,
    );
    setSelectedAntivirusMirrors([]);
    setAntiVirusMirrorsAddText('');
  }

  function onRemoveAntivirusMirrors() {
    if (currentMirrors) {
      form.setFieldValue(
        'zimbraClamAVDatabaseMirror',
        currentMirrors
          .split(',')
          .map((item) => item.trim())
          .filter((item) => !selectedAntivirusMirrors.includes(item))
          .join(', '),
      );
    }
    setSelectedAntivirusMirrors([]);
  }

  function onAddAdditionalAntivirusDefinition() {
    if (!additionalAntiVirusDefinitionAddText.startsWith('http')) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: t(
          'mta.additional_virus_definition_start_with_http_https',
          'Additional Virus Definition should start with http',
        ),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      return;
    }
    const current = currentCustomUrls;
    form.setFieldValue(
      'carbonioClamAVDatabaseCustomURL',
      current
        ? `${current}, ${additionalAntiVirusDefinitionAddText}`
        : additionalAntiVirusDefinitionAddText,
    );
    setSelectedAdditionalAntivirusDefinition([]);
    setAdditionalAntiVirusDefinitionAddText('');
  }

  function removeAdditionalAntivirusDefinition() {
    if (currentCustomUrls) {
      form.setFieldValue(
        'carbonioClamAVDatabaseCustomURL',
        currentCustomUrls
          .split(',')
          .map((item) => item.trim())
          .filter((item) => !selectedAdditionalAntivirusDefinition.includes(item))
          .join(', '),
      );
    }
    setSelectedAdditionalAntivirusDefinition([]);
    setIsShowRemoveAlertDialog(false);
  }

  function onRemoveAdditionalAntivirusDefinition() {
    if (isAdvanced) setIsShowRemoveAlertDialog(true);
    else removeAdditionalAntivirusDefinition();
  }

  function onUpdateMesurementChange(v: Array<SelectItem> | string | null) {
    const opt = intervalOptions.find((item) => item.value === v) || intervalOptions[2];
    form.setFieldValue('zimbraVirusDefinitionsUpdateFrequency', `${updateFrequncy}${opt.value}`);
  }

  function setUpdateFrequncyValue(value: string) {
    form.setFieldValue(
      'zimbraVirusDefinitionsUpdateFrequency',
      `${value}${updateMesurementUnit.value}`,
    );
  }

  function handleCancel() {
    form.reset();
    setSelectedAntivirusMirrors([]);
    setSelectedAdditionalAntivirusDefinition([]);
  }

  function handleSave() {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    void form.handleSubmit().finally(() => {
      saveInFlightRef.current = false;
    });
  }

  return (
    <FormPageLayout
      title={t('mta.antivirus_and_antispam', 'Antivirus & Antispam')}
      onSave={handleSave}
      onCancel={handleCancel}
      unsavedChanges={isDirty}
    >
      <AntispamSection
        form={form}
        allowSetMTA={allowSetMTA}
        spamTagPercentOptions={spamTagPercentOptions}
        spamKillPercentOptions={spamKillPercentOptions}
        discardPassOptions={discardPassOptions}
      />
      <AntivirusDefinitionsSection
        form={form}
        allowSetMTA={allowSetMTA}
        intervalOptions={intervalOptions}
        updateFrequncy={updateFrequncy}
        setUpdateFrequncy={setUpdateFrequncyValue}
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
    </FormPageLayout>
  );
};

export const MTAAntiVirusAndAntiSpam = () => {
  const { data: configInformation = [] } = useAllConfig();

  if (!configInformation.length) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  return (
    <MTAAntiVirusAndAntiSpamForm
      key={configInformation.length}
      configInformation={configInformation}
    />
  );
};
