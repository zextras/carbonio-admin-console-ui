/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Container,
  LabeledValue,
  ListRow,
  NumberInput,
  PlainTextarea,
  Row,
  Select,
  TextInput,
} from '@zextras/ui-components';
import { useCosList } from '@zextras/ui-shared';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { checkValidUserName, convertToAscii, getModifiedName } from '../../utility/utils';
import {
  RESOURCE_TYPE,
  SCHEDULE_POLICY_TYPE,
  STATUS,
  TRUE_FALSE,
} from './resource-edit-detail-view';
import { useResourceForm } from './resource-form-context';

type SelectOption = { label: string; value: string | number };

function resolveGeneratedName(
  changeNameBool: boolean,
  displayName: string | undefined,
  name: string | undefined,
): string {
  if (changeNameBool) {
    return name ?? '';
  }
  const userNameStr = getModifiedName((displayName ?? '').trim());
  const asciiValue = convertToAscii(userNameStr);
  if (userNameStr.length === asciiValue.length && checkValidUserName(asciiValue)) {
    return asciiValue;
  }
  return '';
}

export const ResourceDetailSection = () => {
  const { t } = useTranslation();
  const form = useResourceForm();
  const { data: cosData } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const cosList = cosData?.cos ?? [];
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name ?? '';

  const displayName = useSelector(form.store, (s) => s.values.displayName);
  const name = useSelector(form.store, (s) => s.values.name);
  const changeNameBool = useSelector(form.store, (s) => s.values.changeNameBool);
  const zimbraCalResType = useSelector(form.store, (s) => s.values.zimbraCalResType);
  const zimbraAccountStatus = useSelector(form.store, (s) => s.values.zimbraAccountStatus);
  const zimbraCOSId = useSelector(form.store, (s) => s.values.zimbraCOSId);
  const zimbraCalResAutoDeclineRecurring = useSelector(
    form.store,
    (s) => s.values.zimbraCalResAutoDeclineRecurring,
  );
  const zimbraCalResMaxNumConflictsAllowed = useSelector(
    form.store,
    (s) => s.values.zimbraCalResMaxNumConflictsAllowed,
  );
  const zimbraCalResMaxPercentConflictsAllowed = useSelector(
    form.store,
    (s) => s.values.zimbraCalResMaxPercentConflictsAllowed,
  );
  const zimbraNotes = useSelector(form.store, (s) => s.values.zimbraNotes);
  const schedulePolicyType = useSelector(form.store, (s) => s.values.schedulePolicyType);

  const resourceTypeOptions: Array<SelectOption> = [
    { label: t('label.meeting_room', 'Meeting Room'), value: RESOURCE_TYPE.LOCATION },
    { label: t('label.equipment', 'Equipment'), value: RESOURCE_TYPE.EQUIPMENT },
  ];

  const accountStatusOptions: Array<SelectOption> = [
    { label: t('label.active', 'Active'), value: STATUS.ACTIVE },
    { label: t('label.closed', 'Closed'), value: STATUS.CLOSED },
  ];

  const autoRefuseOptions: Array<SelectOption> = [
    { label: t('label.yes', 'Yes'), value: TRUE_FALSE.TRUE },
    { label: t('label.no', 'No'), value: TRUE_FALSE.FALSE },
  ];

  const schedulePolicyItems: Array<SelectOption> = [
    {
      label: t(
        'label.auto_accept_auto_decline_on_conflict',
        'Automatic acceptance if available, automatic rejection in case of conflict',
      ),
      value: SCHEDULE_POLICY_TYPE.AUTO_ACCEPT,
    },
    {
      label: t(
        'label.manual_accept_auto_decline_on_conflict',
        'Handle acceptance, automatic rejection in case of conflict',
      ),
      value: SCHEDULE_POLICY_TYPE.MANUAL_ACCEPT,
    },
    {
      label: t('label.auto_accept_always', 'Automatic acceptance if available always'),
      value: SCHEDULE_POLICY_TYPE.AUTO_ACCEPT_ALWAYS,
    },
    {
      label: t('label.no_auto_accept_or_decline', 'No automatic acceptance if available always'),
      value: SCHEDULE_POLICY_TYPE.NO_AUTO_ACCEPT,
    },
  ];

  const cosItems: Array<SelectOption> = [
    { label: t('label.auto', 'Auto'), value: '' },
    ...cosList.map((c: { id: string; name: string }) => ({ label: c.name, value: c.id })),
  ];

  const selectedResourceType = resourceTypeOptions.find((o) => o.value === zimbraCalResType);
  const selectedAccountStatus = accountStatusOptions.find((o) => o.value === zimbraAccountStatus);
  const selectedCOS = cosItems.find((o) => o.value === zimbraCOSId) ?? cosItems[0];
  const selectedAutoRefuse = autoRefuseOptions.find(
    (o) => o.value === zimbraCalResAutoDeclineRecurring,
  );
  const selectedSchedulePolicy = schedulePolicyItems.find((o) => o.value === schedulePolicyType);

  function changeDisplayName(e: ChangeEvent<HTMLInputElement>): void {
    form.setFieldValue('displayName', e.target.value);
    if (!changeNameBool) {
      form.setFieldValue('name', resolveGeneratedName(false, e.target.value, ''));
    }
  }

  function changeDescription(e: ChangeEvent<HTMLTextAreaElement>): void {
    form.setFieldValue('zimbraNotes', e.target.value);
  }

  function changeMaxConflicts(value: string): void {
    form.setFieldValue('zimbraCalResMaxNumConflictsAllowed', value);
  }

  function changeMaxPercentConflicts(value: string): void {
    form.setFieldValue('zimbraCalResMaxPercentConflictsAllowed', value);
  }

  function changeResourceName(e: ChangeEvent<HTMLInputElement>): void {
    const cleaned = e.target.value.replaceAll(' ', '').toLowerCase();
    form.setFieldValue('changeNameBool', true);
    form.setFieldValue('name', cleaned);
  }

  function onResourceTypeChange(v: string | number): void {
    form.setFieldValue('zimbraCalResType', String(v));
  }

  function onAccountStatusChange(v: string | number): void {
    form.setFieldValue('zimbraAccountStatus', String(v));
  }

  function onAutoRefuseChange(v: string | number): void {
    form.setFieldValue('zimbraCalResAutoDeclineRecurring', String(v));
  }

  function onCOSIdChange(v: string | number): void {
    form.setFieldValue('zimbraCOSId', String(v));
  }

  function onSchedulePolicyChange(v: string | number): void {
    form.setFieldValue('schedulePolicyType', Number(v));
  }

  return (
    <Container mainAlignment="flex-start">
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 300px)"
        background="white"
        style={{ overflow: 'auto', padding: '16px' }}
      >
        <Row>
          <ds-text as="h3" size="small" weight="bold">
            {t('label.details', 'Details')}
          </ds-text>
        </Row>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <TextInput
              required
              label={t('label.resource_name', 'ResourceName')}
              value={displayName ?? ''}
              name="displayName"
              autoComplete="off"
              onChange={changeDisplayName}
            />
          </Container>
        </ListRow>
        <ListRow>
          <Container
            mainAlignment="space-between"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <Row width="45%">
              <TextInput
                required
                label={t('label.name', 'Name')}
                value={name ?? ''}
                name="name"
                autoComplete="off"
                onChange={changeResourceName}
              />
            </Row>
            <Row width="10%" style={{ padding: '12px' }}>
              <ds-icon icon="AtOutline" color="gray0" size="large"></ds-icon>
            </Row>
            <Row width="45%">
              <LabeledValue
                label={t('label.domain', 'Domain')}
                backgroundColor="gray5"
                value={domainName}
              />
            </Row>
          </Container>
        </ListRow>
        <ListRow>
          <Container
            mainAlignment="space-between"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <Container padding={{ right: 'large' }}>
              <Select
                items={resourceTypeOptions}
                label={t('label.type', 'Type')}
                selection={selectedResourceType ?? resourceTypeOptions[0]}
                onChange={onResourceTypeChange}
              />
            </Container>
            <Container padding={{ right: 'large' }}>
              <Select
                items={accountStatusOptions}
                label={t('label.status', 'Status')}
                selection={selectedAccountStatus ?? accountStatusOptions[0]}
                onChange={onAccountStatusChange}
              />
            </Container>
            <Container>
              <Select
                items={cosItems}
                label={t('label.class_of_service', 'Class of Service')}
                selection={selectedCOS}
                onChange={onCOSIdChange}
              />
            </Container>
          </Container>
        </ListRow>
        <ListRow>
          <Container
            mainAlignment="space-between"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <Container padding={{ right: 'large' }}>
              <Select
                items={autoRefuseOptions}
                label={t('label.auto_refuse', 'Auto-Refuse')}
                selection={selectedAutoRefuse ?? autoRefuseOptions[1]}
                onChange={onAutoRefuseChange}
              />
            </Container>
            <Container padding={{ right: 'large' }}>
              <NumberInput
                label={t('label.maximum_conflict', 'Maximum Conflict')}
                value={zimbraCalResMaxNumConflictsAllowed ?? ''}
                name="zimbraCalResMaxNumConflictsAllowed"
                onChange={changeMaxConflicts}
              />
            </Container>
            <Container>
              <NumberInput
                label={t('label.percentage_maximum_conflict', '% Maximum Conflict')}
                value={zimbraCalResMaxPercentConflictsAllowed ?? ''}
                name="zimbraCalResMaxPercentConflictsAllowed"
                onChange={changeMaxPercentConflicts}
              />
            </Container>
          </Container>
        </ListRow>
        <ListRow>
          <Container
            mainAlignment="space-between"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <Select
              items={schedulePolicyItems}
              label={t('label.schedule_policy', 'Set Policy')}
              selection={selectedSchedulePolicy ?? schedulePolicyItems[0]}
              onChange={onSchedulePolicyChange}
            />
          </Container>
        </ListRow>
        <Row width="100%" padding={{ top: 'medium' }}>
          <ds-divider color="gray3"></ds-divider>
        </Row>
        <ListRow>
          <Container
            mainAlignment="space-between"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <PlainTextarea
              label={t('label.description', 'Description')}
              value={zimbraNotes ?? ''}
              name="zimbraNotes"
              onChange={changeDescription}
            />
          </Container>
        </ListRow>
      </Container>
    </Container>
  );
};
