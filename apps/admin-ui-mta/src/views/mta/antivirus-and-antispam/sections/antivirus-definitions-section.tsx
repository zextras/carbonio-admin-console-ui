/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  Modal,
  Padding,
  Select,
  SelectItem,
  Switch,
  Table,
} from '@zextras/ui-components';
import React, { ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { MtaAntivirusFormApi } from '../types';

type TableRow = { id: string; columns: Array<string | ReactElement> };

type AntivirusDefinitionsSectionProps = Readonly<{
  form: MtaAntivirusFormApi;
  allowSetMTA: boolean;
  intervalOptions: Array<SelectItem>;
  updateFrequncy: string;
  setUpdateFrequncy: (value: string) => void;
  updateMesurementUnit: SelectItem;
  onUpdateMesurementChange: (v: Array<SelectItem> | string | null) => void;
  antiVirusMirrorTableRow: Array<TableRow>;
  antiVirusMirrorHeader: Array<{ id: string; label: string; width: string; bold: boolean }>;
  selectedAntivirusMirrors: Array<string>;
  antiVirusMirrorsAddText: string;
  setAntiVirusMirrorsAddText: (value: string) => void;
  onAddAntivirusMirrors: () => void;
  onRemoveAntivirusMirrors: () => void;
  additionalAntiVirusDefinitionTableRow: Array<TableRow>;
  additionalVirusDefinitionHeader: Array<{
    id: string;
    label: string;
    width: string;
    bold: boolean;
  }>;
  selectedAdditionalAntivirusDefinition: Array<string>;
  additionalAntiVirusDefinitionAddText: string;
  setAdditionalAntiVirusDefinitionAddText: (value: string) => void;
  onAddAdditionalAntivirusDefinition: () => void;
  onRemoveAdditionalAntivirusDefinition: () => void;
  isShowRemoveAlertDialog: boolean;
  setIsShowRemoveAlertDialog: (value: boolean) => void;
  removeAdditionalAntivirusDefinition: () => void;
}>;

export function AntivirusDefinitionsSection({
  form,
  allowSetMTA,
  intervalOptions,
  updateFrequncy,
  setUpdateFrequncy,
  updateMesurementUnit,
  onUpdateMesurementChange,
  antiVirusMirrorTableRow,
  antiVirusMirrorHeader,
  selectedAntivirusMirrors,
  antiVirusMirrorsAddText,
  setAntiVirusMirrorsAddText,
  onAddAntivirusMirrors,
  onRemoveAntivirusMirrors,
  additionalAntiVirusDefinitionTableRow,
  additionalVirusDefinitionHeader,
  selectedAdditionalAntivirusDefinition,
  additionalAntiVirusDefinitionAddText,
  setAdditionalAntiVirusDefinitionAddText,
  onAddAdditionalAntivirusDefinition,
  onRemoveAdditionalAntivirusDefinition,
  isShowRemoveAlertDialog,
  setIsShowRemoveAlertDialog,
  removeAdditionalAntivirusDefinition,
}: AntivirusDefinitionsSectionProps) {
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
          {t('label.antivirus_definitions', 'Antivirus Definitions')}
        </ds-text>
      </Container>

      <Container crossAlignment="flex-start" padding={{ bottom: 'large' }} height="auto">
        <form.Field name="carbonioAmavisDisableVirusCheck">
          {(field) => (
            <Switch
              label={t('mta.disable_virus_check', 'Disable Virus Check')}
              value={field.state.value}
              onClick={(): void => field.handleChange(!field.state.value)}
              disabled={!allowSetMTA}
            />
          )}
        </form.Field>
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'large' }}
        height="auto"
      >
        <Container
          crossAlignment="flex-start"
          padding={{ right: 'medium' }}
          orientation="horizontal"
          mainAlignment="space-between"
          height="auto"
        >
          <Container width="60%" padding={{ right: 'medium' }}>
            <Input
              label={t('mta.definition_mirrors', 'Definition Mirrors')}
              backgroundColor="gray5"
              value={antiVirusMirrorsAddText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setAntiVirusMirrorsAddText(e.target.value);
              }}
              disabled={!allowSetMTA}
            />
          </Container>
          <Container width="15%" crossAlignment="flex-start">
            <Button
              type="outlined"
              size="large"
              label={t('mta.add', 'Add')}
              color="primary"
              onClick={onAddAntivirusMirrors}
              disabled={antiVirusMirrorsAddText === '' || !allowSetMTA}
            />
          </Container>
          <Container width="25%" crossAlignment="flex-start" mainAlignment="flex-start">
            <Button
              type="ghost"
              size="large"
              label={t('mta.remove', 'Remove')}
              color="primary"
              disabled={selectedAntivirusMirrors.length === 0 || !allowSetMTA}
              onClick={onRemoveAntivirusMirrors}
            />
          </Container>
        </Container>
        <Container crossAlignment="flex-start">
          <Container
            crossAlignment="flex-start"
            padding={{ right: 'medium' }}
            orientation="horizontal"
            mainAlignment="space-between"
            height="auto"
          >
            <Container width="60%" padding={{ right: 'medium' }}>
              <Input
                label={t('mta.additional_virus_definition', 'Additional Virus Definition')}
                backgroundColor="gray5"
                value={additionalAntiVirusDefinitionAddText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setAdditionalAntiVirusDefinitionAddText(e.target.value);
                }}
                disabled={!allowSetMTA}
              />
            </Container>
            <Container width="15%" crossAlignment="flex-start">
              <Button
                type="outlined"
                size="large"
                label={t('mta.add', 'Add')}
                color="primary"
                disabled={additionalAntiVirusDefinitionAddText === '' || !allowSetMTA}
                onClick={onAddAdditionalAntivirusDefinition}
              />
            </Container>
            <Container width="25%" crossAlignment="flex-start" mainAlignment="flex-start">
              <Button
                type="ghost"
                size="large"
                label={t('mta.remove', 'Remove')}
                color="primary"
                disabled={selectedAdditionalAntivirusDefinition.length === 0 || !allowSetMTA}
                onClick={onRemoveAdditionalAntivirusDefinition}
              />
            </Container>
          </Container>
        </Container>
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'small' }}
        height="auto"
      >
        <Container
          padding={{
            top: 'small',
            bottom: 'small',
            right: 'medium',
          }}
          mainAlignment="flex-start"
        >
          <Table
            rows={antiVirusMirrorTableRow}
            headers={antiVirusMirrorHeader}
            showCheckbox={false}
            selectedRows={selectedAntivirusMirrors}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Container>
        <Container
          padding={{
            top: 'small',
            bottom: 'small',
          }}
          mainAlignment="flex-start"
        >
          <Table
            rows={additionalAntiVirusDefinitionTableRow}
            headers={additionalVirusDefinitionHeader}
            showCheckbox={false}
            selectedRows={selectedAdditionalAntivirusDefinition}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Container>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'extralarge', top: 'large' }}
        height="auto"
      >
        <Container crossAlignment="flex-start" padding={{ right: 'medium' }} width="70%">
          <Input
            isRequired
            label={t('mta.definition_update_frequency', 'Definition Update Frenquency')}
            backgroundColor="gray5"
            value={updateFrequncy}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setUpdateFrequncy(e.target.value);
            }}
            disabled={!allowSetMTA}
          />
        </Container>
        <Container crossAlignment="flex-start" width="30%">
          <Select
            items={intervalOptions}
            background="gray5"
            showCheckbox={false}
            selection={updateMesurementUnit}
            onChange={onUpdateMesurementChange}
            disabled={!allowSetMTA}
          />
        </Container>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'extralarge', top: 'large' }}
        height="auto"
      >
        <Container crossAlignment="flex-start" padding={{ right: 'medium' }} height="auto">
          <form.Field name="zimbraVirusWarnRecipient">
            {(field) => (
              <Switch
                label={t(
                  'mta.warn_recipients_when_is_quarantined',
                  'Warn recipients when something is quarantined',
                )}
                value={field.state.value}
                onClick={(): void => field.handleChange(!field.state.value)}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start" height="auto">
          <form.Field name="zimbraVirusBlockEncryptedArchive">
            {(field) => (
              <Switch
                label={t('mta.virus_block_encrypted_archive', 'Virus Block Encrypted Archive')}
                value={field.state.value}
                onClick={(): void => field.handleChange(!field.state.value)}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
      </Container>

      <Container crossAlignment="flex-start" height="auto">
        <form.Field name="zimbraVirusWarnAdmin">
          {(field) => (
            <Switch
              label={t(
                'mta.warn_admins_when_something_quarntined',
                'Warn admins when something is quarantined',
              )}
              value={field.state.value}
              onClick={(): void => field.handleChange(!field.state.value)}
              disabled={!allowSetMTA}
            />
          )}
        </form.Field>
      </Container>

      <Modal
        title={
          <Trans
            i18nKey="mta.remove_virus_difinition_warning_title"
            defaults="You are removing <bold>{{name}}</bold> definition"
            components={{ bold: <strong /> }}
            values={{
              name: selectedAdditionalAntivirusDefinition[0],
            }}
          />
        }
        open={isShowRemoveAlertDialog}
        showCloseIcon
        onClose={(): void => {
          setIsShowRemoveAlertDialog(false);
        }}
        size="medium"
        customFooter={
          <Container orientation="horizontal" mainAlignment="space-between">
            <Container orientation="horizontal" mainAlignment="flex-end">
              <Padding all="small">
                <Button
                  label={t('label.yes_remove_it', 'Yes, Remove it')}
                  color="primary"
                  type="outlined"
                  size="medium"
                  onClick={(): void => {
                    removeAdditionalAntivirusDefinition();
                  }}
                />
              </Padding>
              <Button
                color="primary"
                type="outlined"
                label={t('label.keep_it_button', 'NO, KEEP IT')}
                onClick={(): void => {
                  setIsShowRemoveAlertDialog(false);
                }}
              />
            </Container>
          </Container>
        }
      >
        <Container>
          <ds-text as="p" overflow="break-word" weight="regular">
            {t(
              'mta.remove_virus_difinition_warning_line_1',
              'Removing a virus definition will reduce the chance to detect potential threats. This operation is not reversible',
            )}
          </ds-text>
        </Container>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ top: 'extralarge', bottom: 'extralarge' }}
        >
          <ds-text as="p" overflow="break-word" weight="regular">
            {
              <Trans
                i18nKey="mta.remove_virus_difinition_warning_line_2"
                defaults="Are you sure you want to remove the <bold>{{name}}</bold> definition?"
                components={{ bold: <strong /> }}
                values={{
                  name: selectedAdditionalAntivirusDefinition[0],
                }}
              />
            }
          </ds-text>
        </Container>
      </Modal>
    </>
  );
}
