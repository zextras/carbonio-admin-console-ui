/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { keepPreviousData } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  Padding,
  RouteLeavingGuard,
  Row,
} from '@zextras/ui-components';
import { type ConfigAttribute,useAllConfig, useModifyConfig } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeConfigs } from '../../theme/theme-configs';
import { ResetTheme } from '../../theme/theme-reset';
import {
  buildGlobalResetValues,
  buildWhiteLabelConfig,
  buildWhiteLabelResetAttributes,
} from '../../theme/white-label-defaults';
import { whiteLabelSchema } from '../../theme/white-label-schema';

/**
 * Global white-label view: global whitelabel settings (logos, colors,
 * login URLs), saved via ModifyConfig.
 */
export const GlobalWhiteLabel = () => {
  const { data: configInformation = [], isPending, invalidate } = useAllConfig({
    placeholderData: keepPreviousData,
  });

  if (isPending) {
    return <ds-spinner></ds-spinner>;
  }

  return (
    <GlobalWhiteLabelContent configInformation={configInformation} invalidate={invalidate} />
  );
};

const GlobalWhiteLabelContent = ({
  configInformation,
  invalidate,
}: {
  configInformation: Array<ConfigAttribute>;
  invalidate: () => void;
}) => {
  const [t] = useTranslation();
  const [isOpenResetDialog, setIsOpenResetDialog] = useState<boolean>(false);
  const modifyConfigMutation = useModifyConfig();

  const savedThemeConfig = buildWhiteLabelConfig(configInformation);

  const form = useForm({
    defaultValues: savedThemeConfig,
    validators: { onChange: whiteLabelSchema, onSubmit: whiteLabelSchema },
    onSubmit: async ({ value }) => {
      const attributes = Object.entries(value).map(([n, _content]) => ({
        n,
        _content: _content as string,
      }));
      await modifyConfigMutation.mutateAsync(attributes);
      form.reset(value, { keepDefaultValues: true });
      invalidate();
    },
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);
  const canSubmit = useSelector(form.store, (s) => s.canSubmit);

  const onSave = (): void => {
    void form.handleSubmit();
  };

  const onCancel = (): void => {
    form.reset();
  };

  const onResetTheme = (): void => {
    setIsOpenResetDialog(true);
  };

  const closeHandler = (): void => {
    setIsOpenResetDialog(false);
  };

  const onResetHandler = (): void => {
    setIsOpenResetDialog(false);
    modifyConfigMutation.mutate(buildWhiteLabelResetAttributes(), {
      onSuccess: () => {
        form.reset(buildGlobalResetValues(), { keepDefaultValues: true });
        invalidate();
      },
    });
  };

  return (
    <>
      {modifyConfigMutation.isPending && <ds-spinner></ds-spinner>}
      <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
        <Container
          orientation="column"
          background="gray6"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
        >
          <Row mainAlignment="flex-start" width="100%">
            <Container orientation="vertical" mainAlignment="space-around" height="56px">
              <Row orientation="horizontal" width="100%">
                <Row
                  padding={{ all: 'large' }}
                  mainAlignment="flex-start"
                  width="50%"
                  crossAlignment="flex-start"
                >
                  <ds-text as="h1" size="medium" weight="bold" color="gray0">
                    {t('label.whitelabel_settings', 'Whitelabel Settings')}
                  </ds-text>
                </Row>
                <Row
                  padding={{ all: 'large' }}
                  width="50%"
                  mainAlignment="flex-end"
                  crossAlignment="flex-end"
                >
                  <Padding right="small">
                    {isDirty && (
                      <Button
                        label={t('label.cancel', 'Cancel')}
                        color="secondary"
                        onClick={onCancel}
                      />
                    )}
                  </Padding>
                  {isDirty && (
                    <Button
                      label={t('label.save', 'Save')}
                      color="primary"
                      onClick={onSave}
                      disabled={!canSubmit}
                    />
                  )}
                </Row>
              </Row>
            </Container>
            <ds-divider></ds-divider>
          </Row>
          <ThemeConfigs form={form} isGlobalTheme onResetTheme={onResetTheme} />
        </Container>
        {isOpenResetDialog && (
          <ResetTheme
            title={t('label.reset_global_whitelabel_settings', 'Reset global whitelabel settings')}
            isOpenResetDialog={isOpenResetDialog}
            closeHandler={closeHandler}
            onResetHandler={onResetHandler}
          />
        )}
        <RouteLeavingGuard when={isDirty} onSave={onSave} />
      </Container>
    </>
  );
};
