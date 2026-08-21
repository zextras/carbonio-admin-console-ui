/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  Padding,
  RouteLeavingGuard,
  Row,
  useSnackbar,
} from '@zextras/ui-components';
import {
  domainByIdKey,
  flushCache,
  getDomainInformation,
  useAllConfig,
  useUserSettings,
} from '@zextras/ui-shared';
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { TRUE, ZIMBRA_ADMIN_URN } from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { modifyDomain } from '../../../services/modify-domain-service';
import { ThemeConfigs } from '../theme/theme-configs';
import { ResetTheme } from '../theme/theme-reset';
import {
  buildDomainResetValues,
  buildDomainWhiteLabelResetAttributes,
  pickThemeValues,
} from '../theme/white-label-defaults';
import { whiteLabelSchema } from '../theme/white-label-schema';

const DomainTheme = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: configInformation = [] } = useAllConfig();
  const { data: domainWithoutConfig } = useSelectedDomain(0);
  const domainInformation = domainWithoutConfig?.a;
  const { data: selectedDomain } = useSelectedDomain();
  const domainName = selectedDomain?.name;
  const queryClient = useQueryClient();
  const { domainId } = useParams();
  const [isOpenResetDialog, setIsOpenResetDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const userSetting = useUserSettings();
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

  const domainValues = pickThemeValues(domainInformation ?? []);
  const globalTheme = pickThemeValues(configInformation);
  const zimbraId = domainInformation?.find((item) => item.n === 'zimbraId')?._content ?? '';
  // last known server state: the diff baseline for the save payload
  const savedValues = domainValues;

  const modifyDomainRequest = async (body: {
    id: string;
    _jsns: string;
    a: Array<{ n: string; _content: string }>;
  }): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await modifyDomain(body);
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.change_save_success_msg', 'The change has been saved successfully'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      if (isGlobalAdmin) {
        flushCache('domain', 'id', body.id);
      }
      const domain = data?.domain?.[0];
      if (domain) {
        queryClient.setQueryData(domainByIdKey(domainId, 1), domain);
        getDomainInformation(domain.id, 0).then((res) => {
          const domainData = res?.domain?.[0];
          if (domainData) {
            queryClient.setQueryData(domainByIdKey(domainId, 0), domainData);
          }
        });
      }
    } catch (error) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          (error as { message?: string })?.message ??
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const form = useForm({
    defaultValues: domainValues,
    validators: { onChange: whiteLabelSchema, onSubmit: whiteLabelSchema },
    onSubmit: async ({ value }) => {
      const modified = Object.entries(value).filter(
        ([key, val]) => !isEqual(val, (savedValues as Record<string, unknown>)[key]),
      );
      if (modified.length === 0) {
        return;
      }
      const body = {
        id: zimbraId,
        _jsns: ZIMBRA_ADMIN_URN,
        a: modified.map(([n, _content]) => ({ n, _content: _content as string })),
      };
      await modifyDomainRequest(body);
      form.reset(value, { keepDefaultValues: true });
    },
  });

  // sync form with server data while the user has not touched it yet
  useEffect(() => {
    if (!domainInformation) {
      return;
    }
    if (form.state.isTouched || form.state.isDirty) {
      return;
    }
    form.reset(pickThemeValues(domainInformation), { keepDefaultValues: false });
  }, [domainInformation, form]);

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
    void modifyDomainRequest({
      id: zimbraId,
      _jsns: ZIMBRA_ADMIN_URN,
      a: buildDomainWhiteLabelResetAttributes(),
    })
      .then(() => {
        form.reset(buildDomainResetValues(), { keepDefaultValues: true });
      })
      .catch(() => {
        // errors already surfaced via snackbar inside modifyDomainRequest
      });
  };

  return (
    <>
      {isLoading && <ds-spinner></ds-spinner>}
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
                  <ds-text as="h2" size="medium" weight="bold" color="gray0">
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
          <ThemeConfigs
            form={form}
            globalTheme={globalTheme}
            onResetTheme={onResetTheme}
          />
        </Container>
        {isOpenResetDialog && (
          <ResetTheme
            title={t('label.reset_domain_whitelabel_settings', 'Reset {{name}} whitelabel settings', {
              name: domainName,
            })}
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

export default DomainTheme;
