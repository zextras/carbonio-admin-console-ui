/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Container, FormPageLayout } from '@zextras/ui-components';
import { useAllConfig } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeConfigs } from '../../../components/theme/theme-configs';
import { ResetTheme } from '../../../components/theme/theme-reset';
import { pickThemeValues } from '../../../components/theme/white-label-defaults';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { useDomainThemeForm } from './use-domain-theme-form';

export const DomainTheme = () => {
  const [t] = useTranslation();
  const { data: configInformation = [] } = useAllConfig();
  const { data: domainWithoutConfig } = useSelectedDomain(0);
  const domainInformation = domainWithoutConfig?.a;
  const { data: selectedDomain } = useSelectedDomain();
  const domainName = selectedDomain?.name;
  const [isOpenResetDialog, setIsOpenResetDialog] = useState(false);

  const domainValues = pickThemeValues(domainInformation ?? []);
  const globalTheme = pickThemeValues(configInformation);
  const zimbraId = domainInformation?.find((item) => item.n === 'zimbraId')?._content ?? '';

  const { form, handleSave, handleCancel, handleReset, isPending } = useDomainThemeForm({
    defaultValues: domainValues,
    zimbraId,
    savedValues: domainValues,
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

  function onResetTheme(): void {
    setIsOpenResetDialog(true);
  }

  function closeHandler(): void {
    setIsOpenResetDialog(false);
  }

  function onResetHandler(): void {
    setIsOpenResetDialog(false);
    void handleReset();
  }

  return (
    <>
      {isPending && <ds-spinner></ds-spinner>}
      <Container background="gray6" crossAlignment="flex-start" mainAlignment="flex-start">
        <FormPageLayout
          title={t('label.whitelabel_settings', 'Whitelabel Settings')}
          unsavedChanges={isDirty}
          onSave={handleSave}
          onCancel={handleCancel}
        >
          <ThemeConfigs form={form} globalTheme={globalTheme} onResetTheme={onResetTheme} />
        </FormPageLayout>
        {isOpenResetDialog && (
          <ResetTheme
            title={t(
              'label.reset_domain_whitelabel_settings',
              'Reset {{name}} whitelabel settings',
              { name: domainName },
            )}
            isOpenResetDialog={isOpenResetDialog}
            closeHandler={closeHandler}
            onResetHandler={onResetHandler}
          />
        )}
      </Container>
    </>
  );
};
