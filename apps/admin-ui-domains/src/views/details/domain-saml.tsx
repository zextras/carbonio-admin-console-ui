/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  CustomHeaderFactory,
  FormPageLayout,
  HoverableRowFactory,
  Input,
  Padding,
  Row,
  Switch,
  Table,
  useSnackbar,
} from '@zextras/ui-components';
import { TFunction } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import logo from '../../assets/ninja_robo.svg';
import { CONTENT_TYPE_TEXT_PLAIN, SAML_METADATA_JSON_FILE } from '../../constants';
import { useSelectedDomain } from '../../hooks/use-selected-domain';
import { getSamlConfig } from '../../services/get-saml-configurations';
import { useSamlConfig } from '../../services/use-saml-config';
import { useSamlMutation } from '../../services/use-saml-mutation';
import { download } from '../utility/utils';
import styles from './domain-saml.module.css';
import { SamlBanner } from './domain-saml/saml-banner';
import { getSamlAttributes, getSpEndpoints, type SamlAttribute } from './domain-saml/utils';

const SNACKBAR_TIMEOUT = 3000;

type DomainAttribute = { n: string; _content?: string };

type ClearIconProps = { hasError: boolean; hasFocus: boolean; disabled: boolean };

function createInputClearIcon(
  visible: boolean,
  onClear: () => void,
  ariaLabel: string,
): React.ComponentType<ClearIconProps> {
  return function InputClearIcon() {
    return visible ? (
      <button type="button" aria-label={ariaLabel} className={styles.clearButton} onClick={onClear}>
        <ds-icon icon="CloseOutline" size="large" color="secondary" />
      </button>
    ) : null;
  };
}

function buildTableHeaders(
  t: TFunction,
): Array<{ id: string; label: string; width: string; bold: boolean }> {
  return [
    { id: 'attribute', label: t('label.attribute', 'Attribute'), width: '40%', bold: true },
    { id: 'value', label: t('label.value', 'Value'), width: '55%', bold: true },
  ];
}

export const DomainSaml = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name ?? '';
  const domainInformation = domain?.a as Array<DomainAttribute> | undefined;

  const { data: samlConfig, error: samlError } = useSamlConfig(domainName);
  const samlMutation = useSamlMutation(domainName);

  const [isAllowUnsecure, setIsAllowUnsecure] = useState(false);
  const [metadataUrl, setMetadataUrl] = useState('');
  const [samlAttrKey, setSamlAttrKey] = useState('');
  const [samlAttrValue, setSamlAttrValue] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  const samlAttributes = getSamlAttributes(samlConfig);
  const { entityId, serviceUrl } = getSpEndpoints(domainInformation, domainName);
  const headers = buildTableHeaders(t);

  function showSuccessSnackbar(label: string): void {
    createSnackbar({
      key: 'success',
      severity: 'success',
      label,
      autoHideTimeout: SNACKBAR_TIMEOUT,
      hideButton: true,
      replace: true,
    });
  }

  function showErrorSnackbar(error: unknown): void {
    const message =
      error instanceof Error && error.message
        ? error.message
        : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: message,
      autoHideTimeout: SNACKBAR_TIMEOUT,
      hideButton: true,
      replace: true,
    });
  }

  useEffect(() => {
    if (samlError) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          samlError.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: SNACKBAR_TIMEOUT,
        hideButton: true,
        replace: true,
      });
    }
  }, [samlError, createSnackbar, t]);

  function importSAMLConfigurations(): void {
    samlMutation.mutate(
      { op: 'import', url: metadataUrl, allowUnsecure: isAllowUnsecure },
      {
        onSuccess: () =>
          showSuccessSnackbar(
            t('label.you_have_imported_the_configuration', 'You have imported the configuration'),
          ),
        onError: showErrorSnackbar,
      },
    );
  }

  function generateSPCertificates(): void {
    samlMutation.mutate(
      { op: 'generate' },
      {
        onSuccess: () =>
          showSuccessSnackbar(
            t('label.you_have_generated_the_sp_certificate', 'You have generated the SP Certificate'),
          ),
        onError: showErrorSnackbar,
      },
    );
  }

  function addOrUpdateSAMLAttributes(isUpdate: boolean): void {
    if (!samlAttrKey) {
      return;
    }
    samlMutation.mutate(
      { op: 'saveAttribute', key: samlAttrKey, value: samlAttrValue },
      {
        onSuccess: () => {
          setSamlAttrKey('');
          setSamlAttrValue('');
          showSuccessSnackbar(
            isUpdate
              ? t('label.you_have_updated_attribute', {
                  attributeName: samlAttrKey,
                  defaultValue: 'You have updated the {{ attributeName }} attribute',
                })
              : t('label.you_have_added_attribute', {
                  attributeName: samlAttrKey,
                  defaultValue: 'You have added the {{ attributeName }} attribute',
                }),
          );
        },
        onError: showErrorSnackbar,
      },
    );
  }

  function removeSAMLAttributes(): void {
    if (!samlAttrKey) {
      return;
    }
    samlMutation.mutate(
      { op: 'removeAttribute', key: samlAttrKey },
      {
        onSuccess: () => {
          setSamlAttrKey('');
          setSamlAttrValue('');
          showSuccessSnackbar(
            t('label.you_have_removed_attribute', {
              attributeName: samlAttrKey,
              defaultValue: 'You have removed the {{ attributeName }} attribute',
            }),
          );
        },
        onError: showErrorSnackbar,
      },
    );
  }

  function deleteSAMLConfigurations(): void {
    samlMutation.mutate(
      { op: 'deleteConfig' },
      {
        onSuccess: () =>
          showSuccessSnackbar(
            t('label.you_have_deleted_the_configuration', 'You have deleted the configuration'),
          ),
        onError: showErrorSnackbar,
      },
    );
  }

  async function exportMetadata(): Promise<void> {
    try {
      const data = await getSamlConfig(domainName);
      if (data?.error) {
        showErrorSnackbar(new Error(data.error));
        return;
      }
      download(JSON.stringify(data), SAML_METADATA_JSON_FILE, CONTENT_TYPE_TEXT_PLAIN);
      showSuccessSnackbar(
        t('label.you_have_exported_the_configuration', 'You have exported the configuration'),
      );
    } catch (error) {
      showErrorSnackbar(error);
    }
  }

  function openSamlValue(item: SamlAttribute): void {
    setSamlAttrKey(item.attribute);
    setSamlAttrValue(String(item.value ?? ''));
  }

  const samlTableRows = samlAttributes.map((item) => ({
    id: item.attribute,
    columns: [
      <button
        key={item.attribute}
        type="button"
        className={styles.cellButton}
        onClick={() => openSamlValue(item)}
      >
        <ds-text as="span" size="small" weight="regular" color="gray0">
          {item.attribute}
        </ds-text>
      </button>,
      <button
        key={`${item.attribute}-value`}
        type="button"
        className={styles.cellButton}
        onClick={() => openSamlValue(item)}
      >
        <ds-text as="span" size="small" weight="light" color="gray0">
          {String(item.value ?? '')}
        </ds-text>
      </button>,
    ],
  }));

  return (
    <Container
      height="calc(100vh - 105px)"
      background="gray6"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      style={{ overflowY: 'auto' }}
    >
      <FormPageLayout title={`${t('label.saml', 'SAML')} @${domainName}`}>
        {showBanner && (
          <SamlBanner
            entityId={entityId}
            serviceUrl={serviceUrl}
            onDismiss={() => setShowBanner(false)}
          />
        )}

        <Row
          mainAlignment="flex-start"
          width="100%"
          background="gray6"
          padding={{ left: 'large', top: 'medium' }}
        >
          <ds-text as="h3" size="medium" weight="bold">
            {t('label.configuration_lbl', 'Configuration')}
          </ds-text>
        </Row>

        <Row
          width="100%"
          mainAlignment="flex-start"
          crossAlignment="center"
          padding={{ all: 'large' }}
        >
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="vertical"
            width="16%"
          >
            <Switch
              value={isAllowUnsecure}
              label={t('label.allow_unsecure', 'Allow Unsecure')}
              iconColor="primary"
              onClick={() => setIsAllowUnsecure(!isAllowUnsecure)}
            />
          </Container>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="vertical"
            width="72%"
          >
            <Input
              label={t(
                'label.import_saml_metadata_from_idp',
                'Import the SAML Metadata from the IDP',
              )}
              backgroundColor="gray5"
              value={metadataUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setMetadataUrl(e.target.value);
              }}
            />
          </Container>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-end"
            orientation="vertical"
            width="12%"
          >
            <Button
              type="outlined"
              label={t('label.import', 'IMPORT')}
              color="primary"
              size="extralarge"
              onClick={importSAMLConfigurations}
              disabled={!metadataUrl}
            />
          </Container>
        </Row>

        <Row
          width="100%"
          mainAlignment="space-between"
          crossAlignment="center"
          padding={{ all: 'large' }}
        >
          <Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
            <Button
              type="outlined"
              label={t('label.generate_sp_certificate', 'GENERATE SP CERTIFICATE')}
              color="primary"
              size="large"
              width="fill"
              onClick={generateSPCertificates}
            />
          </Container>
          <Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
            <Button
              type="outlined"
              label={t('label.export_configuration', 'EXPORT CONFIGURATION')}
              color="primary"
              size="large"
              width="fill"
              onClick={() => {
                void exportMetadata();
              }}
            />
          </Container>
          <Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
            <Button
              type="ghost"
              label={t('label.delete_configuration', 'DELETE CONFIGURATION')}
              color="primary"
              size="large"
              width="fill"
              onClick={deleteSAMLConfigurations}
            />
          </Container>
        </Row>

        <Row
          width="100%"
          mainAlignment="flex-start"
          crossAlignment="center"
          padding={{ all: 'large' }}
        >
          <Table
            rows={samlTableRows}
            headers={headers}
            showCheckbox={false}
            multiSelect={false}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
            style={samlTableRows.length > 0 ? { height: '15rem', overflow: 'auto' } : undefined}
          />
        </Row>
        {samlTableRows.length === 0 && (
          <Container
            crossAlignment="center"
            mainAlignment="flex-start"
            style={{ marginTop: '1rem' }}
          >
            <ds-text as="span" overflow="break-word" weight="regular" size="large">
              <img src={logo} alt="logo" />
            </ds-text>
            <Padding all="medium" width="25.875rem">
              <ds-text
                as="p"
                color="gray1"
                overflow="break-word"
                weight="regular"
                size="large"
                style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
              >
                {t(
                  'label.saml_metadata_attribute_notes',
                  'Please import some SAML Metadata in the field above to see its attributes',
                )}
              </ds-text>
            </Padding>
          </Container>
        )}

        <Row
          width="100%"
          mainAlignment="space-between"
          crossAlignment="center"
          padding={{ all: 'large' }}
        >
          <Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
            <Button
              type="outlined"
              label={t('label.add', 'ADD')}
              color="primary"
              size="large"
              width="fill"
              onClick={() => {
                addOrUpdateSAMLAttributes(false);
              }}
            />
          </Container>
          <Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
            <Button
              type="outlined"
              label={t('label.update', 'UPDATE')}
              color="primary"
              size="large"
              width="fill"
              onClick={() => {
                addOrUpdateSAMLAttributes(true);
              }}
            />
          </Container>
          <Container width="32%" mainAlignment="flex-start" crossAlignment="flex-start">
            <Button
              type="ghost"
              label={t('label.remove', 'Remove')}
              color="primary"
              size="large"
              width="fill"
              onClick={removeSAMLAttributes}
            />
          </Container>
        </Row>

        <Row
          width="100%"
          mainAlignment="flex-start"
          crossAlignment="center"
          padding={{ all: 'large' }}
        >
          <Container mainAlignment="flex-start" crossAlignment="flex-end" orientation="vertical">
            <Input
              label={t(
                'label.select_an_attribute_to_show_its_value',
                'Select an Attribute to show its value',
              )}
              backgroundColor="gray5"
              value={samlAttrKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSamlAttrKey(e.target.value);
              }}
              CustomIcon={createInputClearIcon(
                Boolean(samlAttrKey),
                () => {
                  setSamlAttrKey('');
                },
                t('label.close', 'Close'),
              )}
            />
          </Container>
        </Row>

        <Row
          width="100%"
          mainAlignment="flex-start"
          crossAlignment="center"
          padding={{ left: 'large', bottom: 'large', right: 'large' }}
        >
          <Container mainAlignment="flex-start" crossAlignment="flex-end" orientation="vertical">
            <Input
              label={t(
                'label.here_will_be_shown_the_attribute_value',
                'The Attribute Value will be displayed here',
              )}
              backgroundColor="gray5"
              value={samlAttrValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSamlAttrValue(e.target.value);
              }}
              CustomIcon={createInputClearIcon(
                Boolean(samlAttrValue),
                () => {
                  setSamlAttrValue('');
                },
                t('label.close', 'Close'),
              )}
            />
          </Container>
        </Row>
      </FormPageLayout>
    </Container>
  );
};
