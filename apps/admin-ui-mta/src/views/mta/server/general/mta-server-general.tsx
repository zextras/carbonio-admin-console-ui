/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Container, FormPageLayout } from '@zextras/ui-components';
import { useAllConfig, useCurrentUserRights, useMtaServers } from '@zextras/ui-shared';
import { find, join, map } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { IpRangeValue } from '../../../../../types';
import {
  CONFIG,
  ZIMBRA_ADMIN_URN,
  ZIMBRA_MTA_MY_NETWORKS,
} from '../../../../constants';
import type { ModifyServerResponse } from '../../../../services/modify-server';
import { useModifyServer } from '../../../../services/use-modify-server';
import { useServerInformation } from '../../../../services/use-server-information';
import { validateIpAddress } from '../../../utility/utils';
import { AntivirusAntispamSection } from './sections/antivirus-antispam-section';
import { AuthenticationSection } from './sections/authentication-section';
import { LoggingSection } from './sections/logging-section';
import {
  ConfigItem,
  MtaServerGeneralFormValues,
  ServerAttr,
} from './types';
import {
  buildInitialState,
  buildModifiedAttributes,
  buildServerSpecificState,
  findAttrContent,
  parseNetworkLabels,
} from './utils/mta-server-general-utils';

type ServerQueryRefetch = () => Promise<{
  data?: { server?: Array<{ a?: Array<ServerAttr> }> };
}>;

type MTAServerGeneralFormProps = Readonly<{
  serverName: string;
  serverAttributes: Array<ServerAttr>;
  serverSpecificAttributes: Array<ServerAttr>;
  configInformation: Array<ConfigItem>;
  refetchServer: ServerQueryRefetch;
  refetchServerSpecific: ServerQueryRefetch;
}>;

const MTAServerGeneralForm = ({
  serverName,
  serverAttributes,
  serverSpecificAttributes,
  configInformation,
  refetchServer,
  refetchServerSpecific,
}: MTAServerGeneralFormProps) => {
  const [t] = useTranslation();
  const { data: rights } = useCurrentUserRights();
  const { data: mtaServerList = [] } = useMtaServers();
  const { mutateAsync: modifyServerAsync } = useModifyServer(serverName);

  const [networkValue, setNetworkValue] = useState<Array<IpRangeValue>>(() =>
    parseNetworkLabels(findAttrContent(serverAttributes, ZIMBRA_MTA_MY_NETWORKS), / {1,2}/),
  );

  const mtaServerSpecificGeneralDetail = buildServerSpecificState(serverSpecificAttributes);

  const networkValueGlobal = parseNetworkLabels(
    configInformation.find(
      (item: Record<string, string>) => item?.n === ZIMBRA_MTA_MY_NETWORKS,
    )?._content,
  );

  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetMTA = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const form = useForm({
    defaultValues: buildInitialState(serverAttributes),
    onSubmit: async ({ value }) => {
      const id = mtaServerList.find((serverItem) => serverItem?.name === serverName)?.id;
      const defaultValues = form.options.defaultValues as MtaServerGeneralFormValues;
      const attributes = buildModifiedAttributes(value, defaultValues);
      const body = { a: attributes, _jsns: ZIMBRA_ADMIN_URN, id };
      try {
        const data: ModifyServerResponse = await modifyServerAsync(body);
        if (data?.server && Array.isArray(data.server)) {
          const serverItem = data.server[0];
          if (serverItem?.a) {
            const [freshServerResult] = await Promise.all([
              refetchServer(),
              refetchServerSpecific(),
            ]);
            const freshAttrs = freshServerResult.data?.server?.[0]?.a ?? [];
            const next = buildInitialState(freshAttrs);
            form.reset(next, { keepDefaultValues: true });
            setNetworkValue(
              parseNetworkLabels(findAttrContent(freshAttrs, ZIMBRA_MTA_MY_NETWORKS), / {1,2}/),
            );
          }
        }
      } catch {
        // Error snackbar is already shown by the hook
      }
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

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
      form.setFieldValue(ZIMBRA_MTA_MY_NETWORKS, value);
    }
    setNetworkValue(data);
  }

  function handleCancel() {
    form.reset();
    const defaultValues = form.options.defaultValues as MtaServerGeneralFormValues;
    setNetworkValue(
      parseNetworkLabels(defaultValues?.zimbraMtaMyNetworks, / {1,2}/),
    );
  }

  function onResetMyNetwork() {
    form.setFieldValue(ZIMBRA_MTA_MY_NETWORKS, undefined);
    setNetworkValue([]);
  }

  return (
    <FormPageLayout
      title={`${t('label.general_lbl', 'General')} - ${serverName}`}
      onSave={() => form.handleSubmit()}
      onCancel={handleCancel}
      unsavedChanges={isDirty}
    >
      <AuthenticationSection
        form={form}
        mtaServerSpecificGeneralDetail={mtaServerSpecificGeneralDetail}
        configInformation={configInformation}
        networkValue={networkValue}
        networkValueGlobal={networkValueGlobal}
        allowSetMTA={allowSetMTA}
        onBlockExtensionChange={onBlockExtensionChange}
        onResetMyNetwork={onResetMyNetwork}
      />

      <AntivirusAntispamSection
        form={form}
        mtaServerSpecificGeneralDetail={mtaServerSpecificGeneralDetail}
        configInformation={configInformation}
        allowSetMTA={allowSetMTA}
      />

      <LoggingSection
        form={form}
        mtaServerSpecificGeneralDetail={mtaServerSpecificGeneralDetail}
        configInformation={configInformation}
      />
    </FormPageLayout>
  );
}

export const MTAServerGeneral = () => {
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

  const serverAttributes: Array<ServerAttr> = serverData?.server?.[0]?.a ?? [];
  const serverSpecificAttributes: Array<ServerAttr> = serverSpecificData?.server?.[0]?.a ?? [];

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
