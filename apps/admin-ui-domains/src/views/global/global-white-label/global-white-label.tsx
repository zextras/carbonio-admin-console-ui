/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { keepPreviousData } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { FormPageLayout } from '@zextras/ui-components';
import { type ConfigAttribute, useAllConfig, useModifyConfig } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeConfigs } from '../../../components/theme/theme-configs';
import { ResetTheme } from '../../../components/theme/theme-reset';
import {
  buildGlobalResetValues,
  buildWhiteLabelConfig,
  buildWhiteLabelResetAttributes,
} from '../../../components/theme/white-label-defaults';
import { whiteLabelSchema } from '../../../components/theme/white-label-schema';

/**
 * Global white-label view: global whitelabel settings (logos, colors,
 * login URLs), saved via ModifyConfig.
 */
export const GlobalWhiteLabel = () => {
  const {
    data: configInformation = [],
    isPending,
    invalidate,
  } = useAllConfig({
    placeholderData: keepPreviousData,
  });

  if (isPending) {
    return <ds-spinner></ds-spinner>;
  }

  return <GlobalWhiteLabelContent configInformation={configInformation} invalidate={invalidate} />;
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
        _content,
      }));
      await modifyConfigMutation.mutateAsync(attributes);
      form.reset(value);
      invalidate();
    },
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

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
      <FormPageLayout
        title={t('label.whitelabel_settings', 'Whitelabel Settings')}
        unsavedChanges={isDirty}
        onCancel={onCancel}
        onSave={onSave}
      >
        <ThemeConfigs form={form} isGlobalTheme onResetTheme={onResetTheme} />
      </FormPageLayout>
      {isOpenResetDialog && (
        <ResetTheme
          title={t('label.reset_global_whitelabel_settings', 'Reset global whitelabel settings')}
          isOpenResetDialog={isOpenResetDialog}
          closeHandler={closeHandler}
          onResetHandler={onResetHandler}
        />
      )}
    </>
  );
};
