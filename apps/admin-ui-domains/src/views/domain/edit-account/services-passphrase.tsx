/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Input,
  LabeledValue,
  Row,
  Select,
  useSnackbar,
} from '@zextras/ui-components';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { useAddCredential } from '../../../services/use-add-credential';
import { useDeleteCredential } from '../../../services/use-delete-credential';
import { ServicesPassphraseServices, ServicesPassphraseStatus } from '../../utility/utils';
import { useAccountForm } from './account-form-context';
import { CredentialCreatedDialog } from './services-passphrase/credential-created-dialog';

interface CredentialTextDataType {
  password?: string;
}

interface CredentialType {
  id?: string;
  label?: string;
  services?: string;
  enabled?: boolean;

  text_data?: CredentialTextDataType;
}

interface SelectServiceType {
  label: string;
  value: string;
}

interface SelectStatusType {
  label?: string;
  value?: boolean;
}

export const ServicesPassphrase = () => {
  const { form, credentialList } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [createCredentialModal, setCreateCredentialModal] = useState<boolean>(false);

  const SERVICE_PASSPHRASE_STATUS = ServicesPassphraseStatus(t);
  const SERVICE_PASSPHRASE_SERVICES: any = ServicesPassphraseServices();
  const [createCredential, setCreateCredential] = useState<CredentialType>({
    label: '',
    services: SERVICE_PASSPHRASE_SERVICES[0].value,
  });

  const [createCredentialResponse, setCreateCredentialResponse] = useState<CredentialType>({
    label: '',
    services: '',
  });

  const accountAddress = `${values?.uid}@${domainName}`;
  const addMutation = useAddCredential(accountAddress);
  const deleteMutation = useDeleteCredential(accountAddress);

  const changeCredLabel = (e: ChangeEvent<HTMLInputElement>): void => {
    setCreateCredential((prev: CredentialType) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onServicesPassphraseServicesChange = (v: any): void => {
    setCreateCredential((prev: CredentialType) => ({ ...prev, services: v }));
  };

  const successSnackbar = (label: string): void => {
    createSnackbar({
      key: 'success',
      severity: 'success',
      label,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  const errorSnackbar = (): void => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: t('label.something_wrong_wrror_msg', 'Something went wrong. Please try again.'),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  const onSave = (): void => {
    addMutation.mutate(
      { label: createCredential.label ?? '', services: createCredential.services ?? '' },
      {
        onSuccess: (res): void => {
          setCreateCredentialResponse({
            label: res?.response?.list?.label,
            services: res?.response?.list?.label,
            text_data: res?.response?.text_data,
          });
          setCreateCredential({
            label: '',
            services: SERVICE_PASSPHRASE_SERVICES[0].value,
          });
          successSnackbar(
            t(
              'account_details.services_passphrase_created_successfully',
              'Services Passphrase created successfully',
            ),
          );
          setCreateCredentialModal(true);
        },
        onError: errorSnackbar,
      },
    );
  };

  const onDelete = (cred: CredentialType): void => {
    deleteMutation.mutate(
      { passwordId: cred.id ?? '' },
      {
        onSuccess: (): void => {
          successSnackbar(
            t(
              'account_details.services_passphrase_deleted_successfully',
              'Services Passphrase deleted successfully',
            ),
          );
        },
        onError: errorSnackbar,
      },
    );
  };

  return (
    <>
      <Row mainAlignment="flex-start" width="100%">
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('account_details.services_passphrase', 'Services Passphrase')}
          </ds-text>
        </Row>
        {credentialList.map((item: CredentialType, index: number) => (
          <Row
            key={`credentialList${index}`}
            padding={{ top: 'large', left: 'large' }}
            width="100%"
            mainAlignment="space-between"
          >
            <Row width="19%" mainAlignment="space-between" style={{ pointerEvents: 'none' }}>
              <LabeledValue
                label={t('account_details.label', 'Label')}
                backgroundColor="gray5"
                value={item.label}
                textColor="secondary"
              />
            </Row>
            <Row
              width="19%"
              mainAlignment="space-between"
              style={{ pointerEvents: 'none' }}
              padding={{ right: 'medium' }}
            >
              <Select
                items={SERVICE_PASSPHRASE_SERVICES}
                background="gray5"
                label={t('account_details.services', 'Services')}
                showCheckbox={false}
                selection={SERVICE_PASSPHRASE_SERVICES.find(
                  (el: SelectServiceType) =>
                    el.value?.toLowerCase() === item.services?.toLowerCase(),
                )}
                disabled
                onChange={(): void => undefined}
              />
            </Row>
            <Row width="19%" mainAlignment="space-between" style={{ pointerEvents: 'none' }}>
              <Select
                items={SERVICE_PASSPHRASE_STATUS}
                background="gray5"
                label={t('account_details.status', 'Status')}
                showCheckbox={false}
                defaultSelection={
                  SERVICE_PASSPHRASE_STATUS.filter(
                    (el: SelectStatusType) => el.value === item?.enabled,
                  )[0]
                }
                onChange={(): null => null}
                style={{ paddingRight: 'medium' }}
                disabled
              />
            </Row>
            <Row width="19%" mainAlignment="space-between" style={{ pointerEvents: 'none' }}>
              <LabeledValue
                label={t('account_details.passphrasaId', 'Passphrase ID')}
                backgroundColor="gray5"
                value={item.id}
                textColor="secondary"
              />
            </Row>
            <Row width="19%" mainAlignment="space-between">
              <Button
                type="outlined"
                label={t('account_details.DELETE', 'DELETE')}
                color="error"
                onClick={(): void => onDelete(item)}
              />
            </Row>
          </Row>
        ))}
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="19%" mainAlignment="space-between">
            <Input
              onChange={changeCredLabel}
              inputName="label"
              label={t('account_details.label', 'Label')}
              backgroundColor="gray5"
              value={createCredential.label}
            />
          </Row>
          <Row width="19%" mainAlignment="space-between" padding={{ right: 'medium' }}>
            <Select
              items={SERVICE_PASSPHRASE_SERVICES}
              background="gray5"
              label={t('account_details.services', 'Services')}
              showCheckbox={false}
              onChange={onServicesPassphraseServicesChange}
              defaultSelection={SERVICE_PASSPHRASE_SERVICES[0]}
            />
          </Row>

          <Row width="19%" mainAlignment="space-between">
            <Button
              type="outlined"
              label={t('account_details.create', 'CREATE')}
              color="primary"
              onClick={onSave}
            />
          </Row>
          <Row width="19%" mainAlignment="space-between"></Row>
          <Row width="19%" mainAlignment="space-between"></Row>
        </Row>
      </Row>
      {createCredentialModal && (
        <CredentialCreatedDialog
          serviceLabel={createCredentialResponse?.label}
          password={createCredentialResponse.text_data?.password}
          onClose={(): void => setCreateCredentialModal(false)}
        />
      )}
    </>
  );
};
