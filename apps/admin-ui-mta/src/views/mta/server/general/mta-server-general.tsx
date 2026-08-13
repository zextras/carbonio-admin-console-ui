/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, ListRow, Padding, Row } from '@zextras/ui-components';
import { useAllConfig, useCurrentUserRights, useMtaServers } from '@zextras/ui-shared';
import { find, isEqual, join, map } from 'lodash-es';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { IpRangeValue, MtaServerGeneral } from '../../../../../types';
import {
  CONFIG,
  FALSE,
  TRUE,
  ZIMBRA_ADMIN_URN,
  ZIMBRA_MTA_MY_NETWORKS,
  ZIMBRA_MTA_RELAY_HOST,
  ZIMBRA_MTA_SASL_AUTH_ENABLED,
} from '../../../../constants';
import { useModifyServer } from '../../../../services/use-modify-server';
import { useServerInformation } from '../../../../services/use-server-information';
import { validateIpAddress } from '../../../utility/utils';
import { AntivirusAntispamSection } from './sections/antivirus-antispam-section';
import { AuthenticationSection } from './sections/authentication-section';
import { LoggingSection } from './sections/logging-section';
import {
  ANTIVIRUS_ATTR_KEYS,
  authEnabledFromContent,
  buildModifiedAttributes,
  findAttrContent,
  LOGGING_ATTR_KEYS,
  parseNetworkLabels,
} from './utils/mta-server-general-utils';

type ServerAttr = { n: string; _content: string };

type FormState = {
  initial: MtaServerGeneral;
  current: MtaServerGeneral;
};

function buildInitialState(
  serverAttributes: Array<ServerAttr>,
): MtaServerGeneral {
  const initialState: Partial<MtaServerGeneral> = {};

  const authEnabled = authEnabledFromContent(
    findAttrContent(serverAttributes, ZIMBRA_MTA_SASL_AUTH_ENABLED),
  );
  if (authEnabled) {
    initialState[ZIMBRA_MTA_SASL_AUTH_ENABLED as keyof MtaServerGeneral] = authEnabled as never;
  }

  const zimbraMtaMyNetworks = findAttrContent(serverAttributes, ZIMBRA_MTA_MY_NETWORKS);
  if (zimbraMtaMyNetworks) {
    initialState[ZIMBRA_MTA_MY_NETWORKS as keyof MtaServerGeneral] = zimbraMtaMyNetworks as never;
  }

  const mtaRelayHost = findAttrContent(serverAttributes, ZIMBRA_MTA_RELAY_HOST);
  if (mtaRelayHost) {
    initialState[ZIMBRA_MTA_RELAY_HOST as keyof MtaServerGeneral] = mtaRelayHost as never;
  }

  ANTIVIRUS_ATTR_KEYS.forEach((key) => {
    const content = findAttrContent(serverAttributes, key);
    if (content) {
      initialState[key as keyof MtaServerGeneral] = content as never;
    }
  });

  LOGGING_ATTR_KEYS.forEach((key) => {
    const content = findAttrContent(serverAttributes, key);
    if (content) {
      initialState[key as keyof MtaServerGeneral] = content as never;
    }
  });

  return initialState as MtaServerGeneral;
}

function buildServerSpecificState(serverSpecificAttributes: Array<ServerAttr>): MtaServerGeneral {
  const state: Partial<MtaServerGeneral> = {};

  const authEnabled = authEnabledFromContent(
    findAttrContent(serverSpecificAttributes, ZIMBRA_MTA_SASL_AUTH_ENABLED),
  );
  if (authEnabled) {
    state[ZIMBRA_MTA_SASL_AUTH_ENABLED as keyof MtaServerGeneral] = authEnabled as never;
  }

  const zimbraMtaMyNetworks = findAttrContent(serverSpecificAttributes, ZIMBRA_MTA_MY_NETWORKS);
  if (zimbraMtaMyNetworks) {
    state[ZIMBRA_MTA_MY_NETWORKS as keyof MtaServerGeneral] = zimbraMtaMyNetworks as never;
  }

  const mtaRelayHost = findAttrContent(serverSpecificAttributes, ZIMBRA_MTA_RELAY_HOST);
  if (mtaRelayHost) {
    state[ZIMBRA_MTA_RELAY_HOST as keyof MtaServerGeneral] = mtaRelayHost as never;
  }

  ANTIVIRUS_ATTR_KEYS.forEach((key) => {
    const content = findAttrContent(serverSpecificAttributes, key);
    if (content) {
      state[key as keyof MtaServerGeneral] = content as never;
    }
  });

  LOGGING_ATTR_KEYS.forEach((key) => {
    const content = findAttrContent(serverSpecificAttributes, key);
    if (content) {
      state[key as keyof MtaServerGeneral] = content as never;
    }
  });

  const myNetworkServerSpecific = findAttrContent(serverSpecificAttributes, ZIMBRA_MTA_MY_NETWORKS);
  const myNetworkValueGlobal = parseNetworkLabels(myNetworkServerSpecific);
  state[ZIMBRA_MTA_MY_NETWORKS as keyof MtaServerGeneral] = (myNetworkServerSpecific ? myNetworkValueGlobal : undefined) as never;

  return state as MtaServerGeneral;
}

type ConfigItem = { n: string; _content: string };

type MTAServerGeneralFormProps = Readonly<{
  serverName: string;
  serverAttributes: Array<ServerAttr>;
  serverSpecificAttributes: Array<ServerAttr>;
  configInformation: Array<ConfigItem>;
  refetchServer: () => Promise<{ data?: { server?: Array<{ a?: Array<ServerAttr> }> } }>;
  refetchServerSpecific: () => Promise<unknown>;
}>;

function MTAServerGeneralForm({
  serverName,
  serverAttributes,
  serverSpecificAttributes,
  configInformation,
  refetchServer,
  refetchServerSpecific,
}: MTAServerGeneralFormProps) {
  const [t] = useTranslation();
  const { data: rights } = useCurrentUserRights();
  const { data: mtaServerList = [] } = useMtaServers();
  const { mutateAsync: modifyServerAsync } = useModifyServer(serverName);

  const [formState, setFormState] = useState<FormState>(() => {
    const initialState = buildInitialState(serverAttributes);
    return { initial: initialState, current: initialState };
  });

  const [networkValue, setNetworkValue] = useState<Array<IpRangeValue>>(() =>
    parseNetworkLabels(findAttrContent(serverAttributes, ZIMBRA_MTA_MY_NETWORKS), / {1,2}/),
  );

  const mtaServerGeneralInitialDetail = formState.initial;
  const mtaServerGeneralDetail = formState.current;

  const mtaServerSpecificGeneralDetail = buildServerSpecificState(serverSpecificAttributes);

  const networkValueGlobal = parseNetworkLabels(
    configInformation.find((item: Record<string, string>) => item?.n === ZIMBRA_MTA_MY_NETWORKS)?._content,
  );

  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetMTA = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const isDirty =
    !!mtaServerGeneralDetail && !isEqual(mtaServerGeneralDetail, mtaServerGeneralInitialDetail);

  function setValue(key: string, value: unknown): void {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, [key]: value } as MtaServerGeneral,
    }));
  }

  function onCancel() {
    setFormState((prev) => ({ ...prev, current: prev.initial }));
    setNetworkValue(
      parseNetworkLabels(findAttrContent(serverAttributes, ZIMBRA_MTA_MY_NETWORKS), / {1,2}/),
    );
  }

  async function modifyServerRequest(attributes: Array<Record<string, string>>): Promise<void> {
    const id = mtaServerList.find((serverItem) => serverItem?.name === serverName)?.id;
    const body = { a: attributes, _jsns: ZIMBRA_ADMIN_URN, id };
    try {
      const data = await modifyServerAsync(body);
      if (data && Array.isArray((data as { server?: unknown[] })?.server)) {
        const serverItem = (data as { server?: Array<{ a?: { n: string; _content: string }[] }> })
          ?.server?.[0];
        if (serverItem?.a) {
          const [freshServerResult] = await Promise.all([
            refetchServer(),
            refetchServerSpecific(),
          ]);
          const freshAttrs = freshServerResult.data?.server?.[0]?.a ?? [];
          const initialState = buildInitialState(freshAttrs);
          setFormState({ initial: initialState, current: initialState });
          setNetworkValue(
            parseNetworkLabels(findAttrContent(freshAttrs, ZIMBRA_MTA_MY_NETWORKS), / {1,2}/),
          );
        }
      }
    } catch {
      // Error snackbar is already shown by the hook
    }
  }

  function onSave() {
    modifyServerRequest(
      buildModifiedAttributes(mtaServerGeneralDetail, mtaServerGeneralInitialDetail),
    );
  }

  function onAmavisLogLevelChange(v: string) {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, zimbraAmavisLogLevel: v } as MtaServerGeneral,
    }));
  }

  function onAmavisSALogLevelChange(v: string) {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, zimbraAmavisSALogLevel: v } as MtaServerGeneral,
    }));
  }

  function onSMTPClientLogLevelChange(v: string) {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, zimbraMtaSmtpdTlsLoglevel: v } as MtaServerGeneral,
    }));
  }

  function onLMTPTlsLogLevelChange(v: string) {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, zimbraMtaLmtpTlsLoglevel: v } as MtaServerGeneral,
    }));
  }

  function onBlockExtensionChange(ips: Array<IpRangeValue>) {
    const data: Array<IpRangeValue> = [];
    map(ips, (ip: IpRangeValue) => {
      if (validateIpAddress(ip.label ?? '')) {
        data.push(ip);
      } else {
        data.push({ ...ip, error: true });
      }
    });
    const value = data.length === 0 ? '' : join(map(data, 'label'), ' ');
    const isErrorValueAvail = data.some((item) => item.error);
    if (allowSetMTA && !isErrorValueAvail) {
      setValue(ZIMBRA_MTA_MY_NETWORKS, value);
    }
    setNetworkValue(data);
  }

  function setEmptyValue(keyName: keyof MtaServerGeneral) {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, [keyName]: undefined } as MtaServerGeneral,
    }));
  }

  function setEmptyValueMyNetwork(keyName: keyof MtaServerGeneral) {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, [keyName]: undefined } as MtaServerGeneral,
    }));
    setNetworkValue([]);
  }

  function changeSwitchOption(key: keyof MtaServerGeneral): void {
    if (mtaServerGeneralDetail) {
      setFormState((prev) => ({
        ...prev,
        current: {
          ...prev.current,
          [key]: mtaServerGeneralDetail[key] === TRUE ? FALSE : TRUE,
        } as MtaServerGeneral,
      }));
    }
  }

  function changeValue(e: ChangeEvent<HTMLInputElement>) {
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        [e.target.name as keyof MtaServerGeneral]: e.target.value,
      } as MtaServerGeneral,
    }));
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
            {t('label.general_lbl', 'General')}
          </ds-text>
          <ds-text as="p" size="medium" overflow="ellipsis" weight="regular">
            <Padding left={'small'}>{serverName}</Padding>
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
        <AuthenticationSection
          mtaServerGeneralDetail={mtaServerGeneralDetail}
          mtaServerSpecificGeneralDetail={mtaServerSpecificGeneralDetail}
          configInformation={configInformation}
          networkValue={networkValue}
          networkValueGlobal={networkValueGlobal}
          allowSetMTA={allowSetMTA}
          onBlockExtensionChange={onBlockExtensionChange}
          changeSwitchOption={changeSwitchOption}
          changeValue={changeValue}
          setEmptyValue={setEmptyValue}
          setEmptyValueMyNetwork={setEmptyValueMyNetwork}
        />

        <AntivirusAntispamSection
          mtaServerGeneralDetail={mtaServerGeneralDetail}
          mtaServerSpecificGeneralDetail={mtaServerSpecificGeneralDetail}
          configInformation={configInformation}
          allowSetMTA={allowSetMTA}
          changeSwitchOption={changeSwitchOption}
          setEmptyValue={setEmptyValue}
        />

        <LoggingSection
          mtaServerGeneralDetail={mtaServerGeneralDetail}
          mtaServerSpecificGeneralDetail={mtaServerSpecificGeneralDetail}
          configInformation={configInformation}
          onAmavisLogLevelChange={onAmavisLogLevelChange}
          onAmavisSALogLevelChange={onAmavisSALogLevelChange}
          onSMTPClientLogLevelChange={onSMTPClientLogLevelChange}
          onLMTPTlsLogLevelChange={onLMTPTlsLogLevelChange}
          setEmptyValue={setEmptyValue}
        />
      </Container>
    </Container>
  );
}

export function MTAServerGeneral() {
  const { server } = useParams();
  const { data: configInformation = [] } = useAllConfig();

  const {
    data: serverData,
    isLoading: isLoadingServer,
    refetch: refetchServer,
  } = useServerInformation(server, false);

  const {
    data: serverSpecificData,
    isLoading: isLoadingServerSpecific,
    refetch: refetchServerSpecific,
  } = useServerInformation(server, true);

  const serverAttributes: Array<ServerAttr> =
    serverData?.server?.[0]?.a ?? [];
  const serverSpecificAttributes: Array<ServerAttr> =
    serverSpecificData?.server?.[0]?.a ?? [];

  const isLoading = isLoadingServer || isLoadingServerSpecific || !configInformation.length;

  if (!server) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  return (
    <MTAServerGeneralForm
      key={server}
      serverName={server}
      serverAttributes={serverAttributes}
      serverSpecificAttributes={serverSpecificAttributes}
      configInformation={configInformation as Array<ConfigItem>}
      refetchServer={refetchServer}
      refetchServerSpecific={refetchServerSpecific}
    />
  );
}
