/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, ListRow, Padding, Row } from '@zextras/ui-components';
import { useAllConfig, useCurrentUserRights } from '@zextras/ui-shared';
import { find, isEqual, uniq } from 'lodash-es';
import { useState } from 'react';
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

type FormState = {
  initial: MtaInboundSecurity;
  current: MtaInboundSecurity;
};

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

function MTAInboundFlowSecurityForm({
  configInformation,
}: {
  configInformation: Array<Record<string, string>>;
}) {
  const [t] = useTranslation();
  const { mutateAsync: modifyConfigAsync } = useModifyConfig();
  const { data: rights } = useCurrentUserRights();

  const [formState, setFormState] = useState<FormState>(() => {
    const initialState = buildInitialState(configInformation);
    return { initial: initialState, current: initialState };
  });

  const [extensionState, setExtensionState] = useState<ExtensionState>(() =>
    buildExtensionState(configInformation),
  );

  const mtaInboundSecurityInitialDetail = formState.initial;
  const mtaInboundSecurityDetail = formState.current;
  const { mtaBlockExtension, commonBlockedExtensions } = extensionState;

  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetMTA = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const isDirty =
    !!mtaInboundSecurityDetail && !isEqual(mtaInboundSecurityDetail, mtaInboundSecurityInitialDetail);

  function setValue(key: string, value: unknown): void {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, [key]: value } as MtaInboundSecurity,
    }));
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
    const attributes = buildSaveAttributes(mtaInboundSecurityDetail);
    modifyConfigRequest(attributes);
  }

  function onCancel() {
    setFormState((prev) => ({ ...prev, current: prev.initial }));
    if (mtaInboundSecurityInitialDetail?.zimbraMtaBlockedExtension) {
      const extension = mtaInboundSecurityInitialDetail?.zimbraMtaBlockedExtension;
      if (extension) {
        const allExtensions: Array<Record<string, string>> = [];
        extension.forEach((item: string) => {
          allExtensions.push({ label: item });
        });
        setExtensionState((prev) => ({ ...prev, mtaBlockExtension: allExtensions }));
      }
    }
  }

  function onBlockExtensionChange(ev: Array<{ label?: string }>) {
    if (ev && ev.length > 0) {
      const validExtensionExpression = /^[A-Za-z0-9]*$/;
      const extension = ev
        .map((item: Record<string, string | undefined>) => item?.label)
        .filter((item): item is string => !!item)
        .filter((item: string) => validExtensionExpression.test(item));
      if (extension && extension.length > 0) {
        setValue(ZIMBRA_MTA_BLOCKED_EXTENSION, extension);
        const validExtension = extension.map((item: string) => ({ label: item }));
        setExtensionState((prev) => ({ ...prev, mtaBlockExtension: validExtension }));
      }
    } else {
      setValue(ZIMBRA_MTA_BLOCKED_EXTENSION, []);
      setExtensionState((prev) => ({ ...prev, mtaBlockExtension: [] }));
    }
  }

  function onCommonBlockExtensionAdd() {
    const allExtension = uniq([
      ...mtaBlockExtension.map((item: Record<string, string>) => item?.label),
      ...commonBlockedExtensions,
    ]);
    setValue(ZIMBRA_MTA_BLOCKED_EXTENSION, allExtension);
    setExtensionState((prev) => ({
      ...prev,
      mtaBlockExtension: allExtension.map((item: string) => ({ label: item })),
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
        height="56px"
      >
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
            {t('mta.inbound_flow_and_security', 'Inbound Flow & Security')}
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
          mtaInboundSecurityDetail={mtaInboundSecurityDetail}
          mtaBlockExtension={mtaBlockExtension}
          allowSetMTA={allowSetMTA}
          setValue={setValue}
          onBlockExtensionChange={onBlockExtensionChange}
          onCommonBlockExtensionAdd={onCommonBlockExtensionAdd}
        />

        <ListRow>
          <ds-divider></ds-divider>
        </ListRow>

        <RejectionSection
          mtaInboundSecurityDetail={mtaInboundSecurityDetail}
          allowSetMTA={allowSetMTA}
          setValue={setValue}
        />

        <ListRow>
          <ds-divider></ds-divider>
        </ListRow>

        <ProtocolChecksSection
          mtaInboundSecurityDetail={mtaInboundSecurityDetail}
          allowSetMTA={allowSetMTA}
          setValue={setValue}
        />
      </Container>
    </Container>
  );
}

export function MTAInboundFlowSecurity() {
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
