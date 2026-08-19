/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { type ChipItem, Container, FormPageLayout } from '@zextras/ui-components';
import { useAllConfig, useCurrentUserRights, useMtaServers } from '@zextras/ui-shared';
import { find, join, map, some, split, trim } from 'lodash-es';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Attribute, IpRangeValue, MtaOutboundFlow, Server, TRow } from '../../../../types';
import {
  ANTISPAM,
  ANTIVIRUS,
  CONFIG,
  FALSE,
  OPENDKIM,
  TRUE,
  ZIMBRA_MTA_FALLBACK_RELAY_HOST,
  ZIMBRA_MTA_MY_HOSTNAME,
  ZIMBRA_MTA_MY_NETWORKS,
  ZIMBRA_MTA_MY_ORIGIN,
  ZIMBRA_MTA_RELAY_HOST,
  ZIMBRA_MTA_SASL_AUTH_ENABLED,
  ZIMBRA_MTA_SMTP_HELLO_NAME,
  ZIMBRA_MTA_TLS_SECURITY_LEVEL,
  ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER,
  ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP,
} from '../../../constants';
import { useModifyConfig } from '../../../services/use-modify-config';
import { validateIpAddress } from '../../utility/utils';
import { GeneralSection } from './sections/general-section';
import { InstancesSection } from './sections/instances-section';

function findConfigValue(config: Array<Record<string, string>>, key: string): string | undefined {
  return config.find((item) => item?.n === key)?._content;
}

function buildInitialState(configInformation: Array<Record<string, string>>): MtaOutboundFlow {
  return {
    zimbraSmtpSendAddOriginatingIP:
      findConfigValue(configInformation, ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP) === TRUE,
    zimbraSmtpSendAddAuthenticatedUser:
      findConfigValue(configInformation, ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER) === TRUE,
    zimbraMtaSaslAuthEnable: findConfigValue(configInformation, ZIMBRA_MTA_SASL_AUTH_ENABLED) ?? '',
    zimbraMtaMyNetworks: findConfigValue(configInformation, ZIMBRA_MTA_MY_NETWORKS) ?? '',
    zimbraMtaSmtpHeloName: findConfigValue(configInformation, ZIMBRA_MTA_SMTP_HELLO_NAME) ?? '',
    zimbraMtaMyHostname: findConfigValue(configInformation, ZIMBRA_MTA_MY_HOSTNAME) ?? '',
    zimbraMtaFallbackRelayHost:
      findConfigValue(configInformation, ZIMBRA_MTA_FALLBACK_RELAY_HOST) ?? '',
    zimbraMtaRelayHost: findConfigValue(configInformation, ZIMBRA_MTA_RELAY_HOST) ?? '',
    zimbraMtaMyOrigin: findConfigValue(configInformation, ZIMBRA_MTA_MY_ORIGIN) ?? '',
    zimbraMtaTlsSecurityLevel:
      findConfigValue(configInformation, ZIMBRA_MTA_TLS_SECURITY_LEVEL) ?? '',
  };
}

function buildNetworkValue(configInformation: Array<Record<string, string>>): Array<IpRangeValue> {
  const zimbraMtaMyNetworks = findConfigValue(configInformation, ZIMBRA_MTA_MY_NETWORKS);
  return zimbraMtaMyNetworks?.trim()
    ? map(split(zimbraMtaMyNetworks, / {1,2}/), (ip) => ({ label: trim(ip) }))
    : [];
}

function setTableValues(
  server: Server,
  tableRow: Array<TRow>,
  t: (key: string, fallback: string) => string,
) {
  const serviceEnabled = server?.a?.filter((item) => item?.n === 'zimbraServiceEnabled');
  const zimbraMtaAuthEnabled = server?.a?.find((item) => item?.n === ZIMBRA_MTA_SASL_AUTH_ENABLED);
  let antivirus: Array<Attribute> = [];
  let antispam: Array<Attribute> = [];
  let opendkim: Array<Attribute> = [];
  if (serviceEnabled && serviceEnabled.length > 0) {
    antivirus = serviceEnabled.filter((item) => item?._content === ANTIVIRUS);
    antispam = serviceEnabled.filter((item) => item?._content === ANTISPAM);
    opendkim = serviceEnabled.filter((item) => item?._content === OPENDKIM);
  }
  let isAuthEnable = t('label.disabled', 'Disabled');
  if (
    zimbraMtaAuthEnabled &&
    zimbraMtaAuthEnabled._content &&
    zimbraMtaAuthEnabled._content === 'yes'
  ) {
    isAuthEnable = t('label.enabled', 'Enabled');
  }
  tableRow.push({
    id: server.id ?? '',
    columns: [
      <ds-text as="span" size="small" weight="regular" key={tableRow.length} color="gray0">
        {server?.name}
      </ds-text>,
      <ds-text as="span" size="small" weight="light" key={tableRow.length} color="gray0">
        {antispam && antispam.length > 0
          ? t('label.active', 'Active')
          : t('label.inactive', 'Inactive')}
      </ds-text>,
      <ds-text as="span" size="small" weight="light" key={tableRow.length} color="gray0">
        {antivirus && antivirus.length > 0
          ? t('label.active', 'Active')
          : t('label.inactive', 'Inactive')}
      </ds-text>,
      <ds-text as="span" size="small" weight="light" key={tableRow.length} color="gray0">
        {isAuthEnable}
      </ds-text>,
      <ds-text as="span" size="small" weight="light" key={tableRow.length} color="gray0">
        {opendkim && opendkim.length > 0
          ? t('label.enabled', 'Enabled')
          : t('label.disabled', 'Disabled')}
      </ds-text>,
    ],
  });
}

type MTAOutBoundFlowFormProps = Readonly<{
  configInformation: Array<Record<string, string>>;
}>;

const MTAOutBoundFlowForm = ({ configInformation }: MTAOutBoundFlowFormProps) => {
  const [t] = useTranslation();
  const { mutateAsync: modifyConfigAsync } = useModifyConfig();
  const { data: mtaServersList = [] } = useMtaServers();
  const { data: rights } = useCurrentUserRights();

  const [networkValue, setNetworkValue] = useState<Array<IpRangeValue>>(() =>
    buildNetworkValue(configInformation),
  );
  const saveInFlightRef = useRef(false);

  const form = useForm({
    defaultValues: buildInitialState(configInformation),
    onSubmit: async ({ value }) => {
      const attributes: Array<Record<string, string>> = [];
      attributes.push({
        n: ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP,
        _content: value.zimbraSmtpSendAddOriginatingIP ? TRUE : FALSE,
      });
      attributes.push({
        n: ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER,
        _content: value.zimbraSmtpSendAddAuthenticatedUser ? TRUE : FALSE,
      });
      if (value.zimbraMtaSaslAuthEnable) {
        attributes.push({
          n: ZIMBRA_MTA_SASL_AUTH_ENABLED,
          _content: value.zimbraMtaSaslAuthEnable,
        });
      }

      attributes.push({
        n: ZIMBRA_MTA_MY_NETWORKS,
        _content: value.zimbraMtaMyNetworks || '',
      });
      attributes.push({
        n: ZIMBRA_MTA_SMTP_HELLO_NAME,
        _content: value.zimbraMtaSmtpHeloName || '',
      });
      attributes.push({
        n: ZIMBRA_MTA_MY_HOSTNAME,
        _content: value.zimbraMtaMyHostname || '',
      });
      attributes.push({
        n: ZIMBRA_MTA_FALLBACK_RELAY_HOST,
        _content: value.zimbraMtaFallbackRelayHost || '',
      });
      attributes.push({
        n: ZIMBRA_MTA_RELAY_HOST,
        _content: value.zimbraMtaRelayHost || '',
      });
      attributes.push({
        n: ZIMBRA_MTA_MY_ORIGIN,
        _content: value.zimbraMtaMyOrigin || '',
      });
      attributes.push({
        n: ZIMBRA_MTA_TLS_SECURITY_LEVEL,
        _content: value.zimbraMtaTlsSecurityLevel || '',
      });

      try {
        await modifyConfigAsync(attributes);
        form.reset(value, { keepDefaultValues: true });
      } catch {
        // Error snackbar is already shown by the hook
      }
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetMTA = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const instancesTableRows: Array<TRow> = [];
  if (mtaServersList && mtaServersList.length > 0) {
    mtaServersList.forEach((server: Server) => {
      if (server?.a?.length) {
        setTableValues(server, instancesTableRows, t);
      }
    });
  }

  function onBlockExtensionChange(ips: Array<ChipItem<string>>) {
    const data: Array<IpRangeValue> = [];
    map(ips, (ip) => {
      const ipValue: IpRangeValue = { label: ip.label };
      if (validateIpAddress(ipValue.label ?? '')) {
        data.push(ipValue);
      } else {
        data.push({ ...ipValue, error: true });
      }
    });
    const value = data.length === 0 ? '' : join(map(data, 'label'), ' ');
    const isErrorValueAvail = some(data || [], { error: true });
    if (allowSetMTA && !isErrorValueAvail) {
      form.setFieldValue('zimbraMtaMyNetworks', value);
    }
    setNetworkValue(data);
  }

  function handleCancel() {
    form.reset();
    setNetworkValue(buildNetworkValue(configInformation));
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
      title={t('mta.outbound_flow', 'Outbound Flow')}
      onSave={handleSave}
      onCancel={handleCancel}
      unsavedChanges={isDirty}
    >
      <GeneralSection
        form={form}
        networkValue={networkValue}
        allowSetMTA={allowSetMTA}
        onBlockExtensionChange={onBlockExtensionChange}
      />

      <InstancesSection instancesTableRows={instancesTableRows} />
    </FormPageLayout>
  );
};

export const MTAOutBoundFlow = () => {
  const { data: configInformation = [] } = useAllConfig();

  if (!configInformation.length) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  return (
    <MTAOutBoundFlowForm key={configInformation.length} configInformation={configInformation} />
  );
};
