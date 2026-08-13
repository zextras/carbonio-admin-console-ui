/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, type ChipItem, Container, ListRow, Padding, Row } from '@zextras/ui-components';
import { useAllConfig, useCurrentUserRights, useMtaServers } from '@zextras/ui-shared';
import { find, isEqual, join, map, some, split, trim } from 'lodash-es';
import { useState } from 'react';
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

type FormState = {
  initial: MtaOutboundFlow;
  current: MtaOutboundFlow;
};

function buildInitialState(configInformation: Array<Record<string, string>>): MtaOutboundFlow {
  const initialState: Partial<MtaOutboundFlow> = {};

  const stringKeys = [
    ZIMBRA_MTA_FALLBACK_RELAY_HOST,
    ZIMBRA_MTA_MY_ORIGIN,
    ZIMBRA_MTA_RELAY_HOST,
    ZIMBRA_MTA_TLS_SECURITY_LEVEL,
    ZIMBRA_MTA_SMTP_HELLO_NAME,
    ZIMBRA_MTA_MY_HOSTNAME,
    ZIMBRA_MTA_SASL_AUTH_ENABLED,
    ZIMBRA_MTA_MY_NETWORKS,
  ];
  stringKeys.forEach((key) => {
    const val = findConfigValue(configInformation, key);
    if (val) initialState[key as keyof MtaOutboundFlow] = val as never;
  });

  const originatingIp = findConfigValue(configInformation, ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP);
  if (originatingIp) {
    initialState[ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP as keyof MtaOutboundFlow] = (originatingIp === TRUE) as never;
  }

  const authenticatedUser = findConfigValue(configInformation, ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER);
  if (authenticatedUser) {
    initialState[ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER as keyof MtaOutboundFlow] = (authenticatedUser === TRUE) as never;
  }

  return initialState as MtaOutboundFlow;
}

function buildNetworkValue(configInformation: Array<Record<string, string>>): Array<IpRangeValue> {
  const zimbraMtaMyNetworks = findConfigValue(configInformation, ZIMBRA_MTA_MY_NETWORKS);
  return zimbraMtaMyNetworks?.trim()
    ? map(split(zimbraMtaMyNetworks, / {1,2}/), (ip) => ({ label: trim(ip) }))
    : [];
}

function setTableValues(server: Server, tableRow: Array<TRow>, t: (key: string, fallback: string) => string) {
  const serviceEnabled = server?.a?.filter(
    (item: Record<string, unknown>) => item?.n === 'zimbraServiceEnabled',
  );
  const zimbraMtaAuthEnabled = server?.a?.find(
    (item: Record<string, unknown>) => item?.n === ZIMBRA_MTA_SASL_AUTH_ENABLED,
  );
  let antivirus: Array<Attribute> = [];
  let antispam: Array<Attribute> = [];
  let opendkim: Array<Attribute> = [];
  if (serviceEnabled && serviceEnabled.length > 0) {
    antivirus = serviceEnabled.filter(
      (item: Record<string, unknown>) => item?._content === ANTIVIRUS,
    );
    antispam = serviceEnabled.filter(
      (item: Record<string, unknown>) => item?._content === ANTISPAM,
    );
    opendkim = serviceEnabled.filter(
      (item: Record<string, unknown>) => item?._content === OPENDKIM,
    );
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

function MTAOutBoundFlowForm({ configInformation }: MTAOutBoundFlowFormProps) {
  const [t] = useTranslation();
  const { mutateAsync: modifyConfigAsync } = useModifyConfig();
  const { data: mtaServersList = [] } = useMtaServers();
  const { data: rights } = useCurrentUserRights();

  const [formState, setFormState] = useState<FormState>(() => {
    const initialState = buildInitialState(configInformation);
    return { initial: initialState, current: initialState };
  });
  const [networkValue, setNetworkValue] = useState<Array<IpRangeValue>>(() =>
    buildNetworkValue(configInformation),
  );

  const mtaOutboundFlowInitialDetail = formState.initial;
  const mtaOutboundDetail = formState.current;

  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetMTA = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const isDirty = !!mtaOutboundDetail && !isEqual(mtaOutboundDetail, mtaOutboundFlowInitialDetail);

  function setValue(key: string, value: unknown): void {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, [key]: value } as MtaOutboundFlow,
    }));
  }

  const instancesTableRows: Array<TRow> = [];
  if (mtaServersList && mtaServersList.length > 0) {
    mtaServersList.forEach((server: Server) => {
      if (server && server?.a && Array.isArray(server?.a) && server?.a.length > 0) {
        setTableValues(server, instancesTableRows, t);
      }
    });
  }

  async function modifyConfigRequest(attributes: Array<Record<string, string>>): Promise<void> {
    try {
      await modifyConfigAsync(attributes);
      setFormState((prev) => ({ ...prev, initial: prev.current }));
    } catch {
      // Error snackbar is already shown by the hook
    }
  }

  function onSave() {
    const attributes: Array<Record<string, string>> = [];
    attributes.push({
      n: ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP,
      _content: mtaOutboundDetail?.zimbraSmtpSendAddOriginatingIP ? TRUE : FALSE,
    });
    attributes.push({
      n: ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER,
      _content: mtaOutboundDetail?.zimbraSmtpSendAddAuthenticatedUser ? TRUE : FALSE,
    });
    if (mtaOutboundDetail?.zimbraMtaSaslAuthEnable) {
      attributes.push({
        n: ZIMBRA_MTA_SASL_AUTH_ENABLED,
        _content: mtaOutboundDetail?.zimbraMtaSaslAuthEnable,
      });
    }

    attributes.push({
      n: ZIMBRA_MTA_MY_NETWORKS,
      _content: mtaOutboundDetail?.zimbraMtaMyNetworks || '',
    });
    attributes.push({
      n: ZIMBRA_MTA_SMTP_HELLO_NAME,
      _content: mtaOutboundDetail?.zimbraMtaSmtpHeloName || '',
    });
    attributes.push({
      n: ZIMBRA_MTA_MY_HOSTNAME,
      _content: mtaOutboundDetail?.zimbraMtaMyHostname || '',
    });
    attributes.push({
      n: ZIMBRA_MTA_FALLBACK_RELAY_HOST,
      _content: mtaOutboundDetail?.zimbraMtaFallbackRelayHost || '',
    });
    attributes.push({
      n: ZIMBRA_MTA_RELAY_HOST,
      _content: mtaOutboundDetail?.zimbraMtaRelayHost || '',
    });
    attributes.push({
      n: ZIMBRA_MTA_MY_ORIGIN,
      _content: mtaOutboundDetail?.zimbraMtaMyOrigin || '',
    });
    attributes.push({
      n: ZIMBRA_MTA_TLS_SECURITY_LEVEL,
      _content: mtaOutboundDetail?.zimbraMtaTlsSecurityLevel || '',
    });
    modifyConfigRequest(attributes);
  }

  function onCancel() {
    setFormState((prev) => ({ ...prev, current: prev.initial }));
    setNetworkValue(buildNetworkValue(configInformation));
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
      setValue(ZIMBRA_MTA_MY_NETWORKS, value);
    }
    setNetworkValue(data);
  }

  return (
    <Container background="gray6" mainAlignment="flex-start">
      <Row
        mainAlignment="flex-start"
        crossAlignment="center"
        orientation="horizontal"
        background="gray6"
        width="fill"
        height="3.5rem"
      >
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
            {t('mta.outbound_flow', 'Outbound Flow')}
          </ds-text>
        </Row>
        <Row>
          {isDirty && (
            <Container
              orientation="horizontal"
              mainAlignment="flex-end"
              crossAlignment="flex-end"
              background="gray6"
            >
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
      <ListRow>
        <ds-divider></ds-divider>
      </ListRow>
      <Container
        padding={{ all: 'extralarge' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 10.5rem)"
        style={{ overflow: 'auto' }}
      >
        <GeneralSection
          mtaOutboundDetail={mtaOutboundDetail}
          networkValue={networkValue}
          allowSetMTA={allowSetMTA}
          setValue={setValue}
          onBlockExtensionChange={onBlockExtensionChange}
        />

        <InstancesSection instancesTableRows={instancesTableRows} />
      </Container>
    </Container>
  );
}

export function MTAOutBoundFlow() {
  const { data: configInformation = [] } = useAllConfig();

  if (!configInformation.length) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  return <MTAOutBoundFlowForm key={configInformation.length} configInformation={configInformation} />;
}
