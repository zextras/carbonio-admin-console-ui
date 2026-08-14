/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Container, FormPageLayout, ListRow } from '@zextras/ui-components';
import { useAllConfig, useCurrentUserRights } from '@zextras/ui-shared';
import { find, uniq } from 'lodash-es';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { MtaInboundSecurity } from '../../../../types';
import { CONFIG, ZIMBRA_MTA_BLOCKED_EXTENSION } from '../../../constants';
import { useModifyConfig } from '../../../services/use-modify-config';
import { ProtocolChecksSection } from './sections/protocol-checks-section';
import { RejectionSection } from './sections/rejection-section';
import { SettingsSection } from './sections/settings-section';
import {
  buildSaveAttributes,
  parseBlockExtensionData,
  parseBlockExtensionWarningData,
  parseMtaRestrictionData,
  parseSmtpdRejectionData,
} from './utils/inbound-security-utils';

type ExtensionState = {
  mtaBlockExtension: Array<Record<string, string>>;
  commonBlockedExtensions: Array<string>;
};

function buildInitialState(configInformation: Array<Record<string, string>>): MtaInboundSecurity {
  const blockExtResult = parseBlockExtensionData(configInformation);
  const warningData = parseBlockExtensionWarningData(configInformation);
  const rejectionData = parseSmtpdRejectionData(configInformation);
  const restrictionData = parseMtaRestrictionData(configInformation);

  return {
    ...warningData,
    ...rejectionData,
    ...restrictionData,
    zimbraMtaBlockedExtension: blockExtResult.currentBlockedExtension,
  } as MtaInboundSecurity;
}

function buildExtensionState(configInformation: Array<Record<string, string>>): ExtensionState {
  const blockExtResult = parseBlockExtensionData(configInformation);
  return {
    mtaBlockExtension: blockExtResult.mtaBlockExtension,
    commonBlockedExtensions: blockExtResult.commonBlockedExtensions,
  };
}

type MTAInboundFlowSecurityFormProps = Readonly<{
  configInformation: Array<Record<string, string>>;
}>;

const MTAInboundFlowSecurityForm = ({ configInformation }: MTAInboundFlowSecurityFormProps) => {
  const [t] = useTranslation();
  const { mutateAsync: modifyConfigAsync } = useModifyConfig();
  const { data: rights } = useCurrentUserRights();

  const [extensionState, setExtensionState] = useState<ExtensionState>(() =>
    buildExtensionState(configInformation),
  );
  const saveInFlightRef = useRef(false);

  const { mtaBlockExtension, commonBlockedExtensions } = extensionState;

  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetMTA = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const form = useForm({
    defaultValues: buildInitialState(configInformation),
    onSubmit: async ({ value }) => {
      try {
        const attributes = buildSaveAttributes(value);
        await modifyConfigAsync(attributes);
        form.reset(value, { keepDefaultValues: true });
        const extension = value[ZIMBRA_MTA_BLOCKED_EXTENSION];
        if (extension) {
          setExtensionState((prev) => ({
            ...prev,
            mtaBlockExtension: extension.map((item: string) => ({ label: item })),
          }));
        }
      } catch {
        // Error snackbar is already shown by the hook
      }
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  function onBlockExtensionChange(ev: Array<{ label?: string }>) {
    if (ev && ev.length > 0) {
      const validExtensionExpression = /^[A-Za-z0-9]*$/;
      const extension = ev
        .map((item: Record<string, string | undefined>) => item?.label)
        .filter((item): item is string => !!item)
        .filter((item: string) => validExtensionExpression.test(item));
      if (extension && extension.length > 0) {
        form.setFieldValue(ZIMBRA_MTA_BLOCKED_EXTENSION, extension);
        const validExtension = extension.map((item: string) => ({ label: item }));
        setExtensionState((prev) => ({ ...prev, mtaBlockExtension: validExtension }));
      }
    } else {
      form.setFieldValue(ZIMBRA_MTA_BLOCKED_EXTENSION, []);
      setExtensionState((prev) => ({ ...prev, mtaBlockExtension: [] }));
    }
  }

  function onCommonBlockExtensionAdd() {
    const allExtension = uniq([
      ...mtaBlockExtension.map((item: Record<string, string>) => item?.label),
      ...commonBlockedExtensions,
    ]);
    form.setFieldValue(ZIMBRA_MTA_BLOCKED_EXTENSION, allExtension);
    setExtensionState((prev) => ({
      ...prev,
      mtaBlockExtension: allExtension.map((item: string) => ({ label: item })),
    }));
  }

  function handleCancel() {
    form.reset();
    const defaultValues = form.options.defaultValues;
    if (defaultValues?.zimbraMtaBlockedExtension) {
      const extension = defaultValues.zimbraMtaBlockedExtension;
      setExtensionState((prev) => ({
        ...prev,
        mtaBlockExtension: extension.map((item: string) => ({ label: item })),
      }));
    } else {
      setExtensionState((prev) => ({ ...prev, mtaBlockExtension: [] }));
    }
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
      title={t('mta.inbound_flow_and_security', 'Inbound Flow & Security')}
      onSave={handleSave}
      onCancel={handleCancel}
      unsavedChanges={isDirty}
    >
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ bottom: 'extralarge' }}
      >
        <ds-text as="p" size="small">
          <Trans
            i18nKey="mta.important_mta_reboot_information_message"
            defaults="<bold>IMPORTANT: Any changes made on this page will require a reboot of the MTA</bold> for them to take effect. Simply saving the changes will not suffice."
            components={{ bold: <strong /> }}
          />
        </ds-text>
      </Container>
      <Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
        <ds-divider></ds-divider>
      </Container>

      <SettingsSection
        form={form}
        mtaBlockExtension={mtaBlockExtension}
        allowSetMTA={allowSetMTA}
        onBlockExtensionChange={onBlockExtensionChange}
        onCommonBlockExtensionAdd={onCommonBlockExtensionAdd}
      />

      <ListRow>
        <ds-divider></ds-divider>
      </ListRow>

      <RejectionSection form={form} allowSetMTA={allowSetMTA} />

      <ListRow>
        <ds-divider></ds-divider>
      </ListRow>

      <ProtocolChecksSection form={form} allowSetMTA={allowSetMTA} />
    </FormPageLayout>
  );
}

export const MTAInboundFlowSecurity = () => {
  const { data: configInformation = [] } = useAllConfig();

  if (!configInformation.length) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  return (
    <MTAInboundFlowSecurityForm key={configInformation.length} configInformation={configInformation} />
  );
}
