/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type AnyFormApi, useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  FormPageLayout,
  Input,
  ListRow,
  Padding,
  Row,
  Switch,
  useSnackbar,
} from '@zextras/ui-components';
import { useMailstoreServers } from '@zextras/ui-shared';
import { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { AntiDosConfig } from '../../../services/use-anti-dos-config';
import { usePurgeActiveSync } from '../../../services/use-purge-active-sync';
import { useRestartJail } from '../../../services/use-restart-jail';
import {
  type SaveAntiDosSettingInput,
  useSaveAntiDosSetting,
} from '../../../services/use-save-anti-dos-setting';
import styles from './global-active-sync.module.css';
import {
  type GlobalActiveSyncFormValues,
  globalActiveSyncSchema,
} from './global-active-sync.schema';

const NUMERIC_FIELDS = ['jailDuration', 'maxRequests', 'timeWindow'] as const;

type NumericField = (typeof NUMERIC_FIELDS)[number];

type CreateSnackbar = ReturnType<typeof useSnackbar>;

function isNumericInputValue(value: string): boolean {
  return /^\d+$/.test(value);
}

function buildChangedSettingInputs(
  values: GlobalActiveSyncFormValues,
  config: AntiDosConfig,
): Array<SaveAntiDosSettingInput> {
  const inputs: Array<SaveAntiDosSettingInput> = [];
  if (values.enabled !== config.enabled) {
    inputs.push({ field: 'enabled', value: values.enabled });
  }
  NUMERIC_FIELDS.forEach((field) => {
    if (values[field] !== config[field]) {
      inputs.push({ field, value: Number(values[field]) });
    }
  });
  return inputs;
}

function getMailstoreServerNames(servers: Array<{ name?: string }>): Array<string> {
  return servers.map((server) => server.name).filter((name): name is string => Boolean(name));
}

function showSnackbar(
  createSnackbar: CreateSnackbar,
  key: string,
  severity: 'success' | 'error',
  label: string,
): void {
  createSnackbar({
    key,
    severity,
    label,
    autoHideTimeout: 3000,
    hideButton: true,
    replace: true,
  });
}

type NumericSettingInputProps = {
  form: AnyFormApi;
  field: NumericField;
  label: string;
};

const NumericSettingInput = ({ form, field, label }: NumericSettingInputProps) => {
  const [t] = useTranslation();
  const value = useSelector(form.store, (s) => (s.values as GlobalActiveSyncFormValues)[field]);
  const hasError = !isNumericInputValue(value);

  return (
    <Input
      label={label}
      backgroundColor="gray5"
      value={value}
      type="number"
      hasError={hasError}
      description={hasError ? t('error.invalid_number', 'Please enter a valid number') : ''}
      onChange={(e: ChangeEvent<HTMLInputElement>): void => {
        form.setFieldValue(field, e.target.value);
      }}
    />
  );
};

export type GlobalActiveSyncContentProps = {
  config: AntiDosConfig;
};

export const GlobalActiveSyncContent = ({ config }: GlobalActiveSyncContentProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: mailstoresList = [] } = useMailstoreServers();
  const saveSettingMutation = useSaveAntiDosSetting();
  const restartJailMutation = useRestartJail();
  const purgeActiveSyncMutation = usePurgeActiveSync();

  const fallbackError = t(
    'label.something_wrong_error_msg',
    'Something went wrong. Please try again.',
  );

  const form = useForm({
    defaultValues: config,
    validators: { onChange: globalActiveSyncSchema, onSubmit: globalActiveSyncSchema },
    onSubmit: async ({ value }) => {
      const results = await Promise.allSettled(
        buildChangedSettingInputs(value, config).map((input) =>
          saveSettingMutation.mutateAsync(input),
        ),
      );
      const failures = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );
      if (failures.length > 0) {
        const reason = failures[0]?.reason;
        showSnackbar(
          createSnackbar,
          'error',
          'error',
          reason instanceof Error ? reason.message : fallbackError,
        );
        return;
      }
      showSnackbar(
        createSnackbar,
        'success',
        'success',
        t(
          'label.the_last_changes_has_been_saved_successfully',
          'Changes have been saved successfully',
        ),
      );
      form.reset(value, { keepDefaultValues: true });
    },
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);
  const enabled = useSelector(form.store, (s) => (s.values as GlobalActiveSyncFormValues).enabled);

  function restartJail(): void {
    const serverNames = getMailstoreServerNames(mailstoresList);
    if (serverNames.length === 0) {
      return;
    }
    restartJailMutation.mutate(serverNames, {
      onSuccess: () => {
        showSnackbar(
          createSnackbar,
          'success',
          'success',
          t('label.servers_have_been_restared', 'Servers have been restared'),
        );
      },
      onError: (error: Error) => {
        showSnackbar(createSnackbar, 'error', 'error', error.message || fallbackError);
      },
    });
  }

  function purgeActiveSync(): void {
    if (getMailstoreServerNames(mailstoresList).length === 0) {
      return;
    }
    purgeActiveSyncMutation.mutate(undefined, {
      onSuccess: () => {
        showSnackbar(
          createSnackbar,
          'success',
          'success',
          t(
            'label.active_sync_has_been_purged_successfully',
            'ActiveSync has been purged successfully',
          ),
        );
      },
      onError: (error: Error) => {
        showSnackbar(createSnackbar, 'error', 'error', error.message || fallbackError);
      },
    });
  }

  return (
    <div className={styles.page}>
      <FormPageLayout
        title={t('label.active_sync', 'ActiveSync')}
        unsavedChanges={isDirty}
        onCancel={() => form.reset()}
        onSave={() => form.handleSubmit()}
      >
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          width="100%"
        >
          <Row mainAlignment="flex-end" width="100%">
            <Padding right="large">
              <Button
                type="outlined"
                label={t('label.restart_jail', 'Restart Jail')}
                color="primary"
                size="large"
                onClick={restartJail}
                loading={restartJailMutation.isPending}
              />
            </Padding>
            <Button
              type="outlined"
              label={t('label.purge_active_sync', 'Purge ActiveSync')}
              color="primary"
              size="large"
              onClick={purgeActiveSync}
              loading={purgeActiveSyncMutation.isPending}
            />
          </Row>
          <Row mainAlignment="flex-start" width="100%" background="gray6">
            <ds-text as="h2" size="small" weight="bold">
              {t('label.mobile_dos_protection', 'Mobile DOS Protection')}
            </ds-text>
          </Row>
          <ListRow>
            <Container
              crossAlignment="flex-start"
              mainAlignment="flex-start"
              padding={{ top: 'extralarge' }}
            >
              <Switch
                label={t(
                  'label.enable_the_mobile_dos_protection_service',
                  'Enable the Mobile DOS Protection Service',
                )}
                value={enabled}
                onClick={(): void => {
                  form.setFieldValue('enabled', !enabled);
                }}
                iconColor="primary"
              />
            </Container>
            <Container padding={{ all: 'medium' }}>
              <NumericSettingInput
                form={form}
                field="jailDuration"
                label={t('domain.jail_duration', 'Jail Duration (ms)')}
              />
            </Container>
          </ListRow>
          <ListRow>
            <Container padding={{ all: 'medium' }}>
              <NumericSettingInput
                form={form}
                field="maxRequests"
                label={t('label.maximum_of_requests_allowed', 'Maximum of Requests Allowed')}
              />
            </Container>
            <Container padding={{ all: 'medium' }}>
              <NumericSettingInput
                form={form}
                field="timeWindow"
                label={t(
                  'label.time_window_for_allowed_requests',
                  'Time Window for Allowed Requests (ms)',
                )}
              />
            </Container>
          </ListRow>
        </Container>
      </FormPageLayout>
    </div>
  );
};
