/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  HorizontalWizard,
  WizardInSection,
} from '@zextras/ui-components';
import { type TFunction } from 'i18next';
import { type ComponentProps, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import { useCreateCalResource } from '../../../../services/use-cal-resource';
import { ResourceCreateSection } from './resource-create-section';
import { ResourceDetailSection } from './resource-detail-section';
import { SCHEDULE_POLICY_TYPE } from './resource-edit-detail-view';
import { ResourceFormContext } from './resource-form-context';
import { ResourceSharingSection } from './resource-sharing-section';
import { type CreateResourceFormValues } from './schema';
import { useCreateResourceForm } from './use-create-resource-form';

type CreateResourceProps = {
  onClose: () => void;
};

type WizardButtonProps = ComponentProps<typeof Button>;

type CreateResourceWizardButtons = {
  CancelButton: (props: WizardButtonProps) => ReactElement;
  DisabledPrevButton: (props: WizardButtonProps) => ReactElement;
  PrevButton: (props: WizardButtonProps) => ReactElement;
  NextButton: (props: WizardButtonProps) => ReactElement;
  CreateButton: (props: WizardButtonProps) => ReactElement;
};

function createResourceWizardButtons(
  t: TFunction,
  onClose: () => void,
  onCreate: () => void,
  isCreateDisabled: boolean,
): CreateResourceWizardButtons {
  const CancelButton = (props: WizardButtonProps): ReactElement => (
    <Button
      {...props}
      type="outlined"
      key="wizard-cancel"
      label="CANCEL"
      color="secondary"
      icon="CloseOutline"
      iconPlacement="right"
      onClick={onClose}
    />
  );

  const DisabledPrevButton = (props: WizardButtonProps): ReactElement => (
    <Button
      {...props}
      label={t('label.back', 'BACK')}
      icon="ChevronLeftOutline"
      color="secondary"
      iconPlacement="left"
      disabled
    />
  );

  const PrevButton = (props: WizardButtonProps): ReactElement => (
    <Button
      {...props}
      label={t('label.back', 'BACK')}
      icon="ChevronLeftOutline"
      color="secondary"
      iconPlacement="left"
    />
  );

  const NextButton = (props: WizardButtonProps): ReactElement => (
    <Button
      {...props}
      label={t('label.next', 'NEXT')}
      icon="ChevronRightOutline"
      iconPlacement="right"
    />
  );

  const CreateButton = (props: WizardButtonProps): ReactElement => (
    <Button
      {...props}
      label={t('label.create', 'CREATE')}
      icon="PowerOutline"
      iconPlacement="right"
      disabled={isCreateDisabled}
      onClick={onCreate}
    />
  );

  return { CancelButton, DisabledPrevButton, PrevButton, NextButton, CreateButton };
}

function buildAttributeList(values: CreateResourceFormValues): Array<{ n: string; _content: string }> {
  const schedulePolicyValue = values.schedulePolicyType;
  const attrs: Record<string, string> = {
    displayName: values.displayName,
    zimbraNotes: values.zimbraNotes,
    zimbraCalResMaxNumConflictsAllowed: values.zimbraCalResMaxNumConflictsAllowed,
    zimbraCalResMaxPercentConflictsAllowed: values.zimbraCalResMaxPercentConflictsAllowed,
    zimbraCOSId: values.zimbraCOSId,
    zimbraCalResType: values.zimbraCalResType,
    zimbraAccountStatus: values.zimbraAccountStatus,
    zimbraCalResAutoDeclineRecurring: values.zimbraCalResAutoDeclineRecurring,
    zimbraCalResAutoAcceptDecline:
      schedulePolicyValue === SCHEDULE_POLICY_TYPE.AUTO_ACCEPT ||
      schedulePolicyValue === SCHEDULE_POLICY_TYPE.AUTO_ACCEPT_ALWAYS
        ? 'TRUE'
        : 'FALSE',
    zimbraCalResAutoDeclineIfBusy:
      schedulePolicyValue === SCHEDULE_POLICY_TYPE.AUTO_ACCEPT ||
      schedulePolicyValue === SCHEDULE_POLICY_TYPE.MANUAL_ACCEPT
        ? 'TRUE'
        : 'FALSE',
  };

  const list = Object.entries(attrs).map(([n, _content]) => ({ n, _content }));
  values.sendInviteList.forEach((item) => {
    list.push({ n: 'zimbraPrefCalendarForwardInvitesTo', _content: item._content });
  });
  return list;
}

export const CreateResource = ({ onClose }: CreateResourceProps) => {
  const { t } = useTranslation();
  const createResource = useCreateCalResource();
  const { data: selectedDomain } = useSelectedDomain();
  const form = useCreateResourceForm();

  const displayName = useSelector(form.store, (s) => s.values.displayName);
  const isFormValid = useSelector(form.store, (s) => s.isValid);

  function handleCreate(): void {
    const values = form.state.values;
    const name = `${values.name}@${selectedDomain?.name ?? ''}`;
    createResource.mutate(
      {
        name,
        password: values.password,
        attributes: buildAttributeList(values),
        resourceName: values.displayName,
        signatureList: values.signaturelist,
        zimbraPrefCalendarAutoAcceptSignatureId: values.zimbraPrefCalendarAutoAcceptSignatureId,
        zimbraPrefCalendarAutoDeclineSignatureId: values.zimbraPrefCalendarAutoDeclineSignatureId,
        zimbraPrefCalendarAutoDenySignatureId: values.zimbraPrefCalendarAutoDenySignatureId,
      },
      { onSuccess: () => onClose() },
    );
  }

  const {
    CancelButton,
    DisabledPrevButton,
    PrevButton,
    NextButton,
    CreateButton,
  } = createResourceWizardButtons(
    t,
    onClose,
    handleCreate,
    !displayName || !isFormValid || createResource.isPending,
  );

  const wizardSteps = [
    {
      name: 'details',
      label: t('label.details', 'DETAILS'),
      icon: 'InfoOutline',
      view: ResourceDetailSection,
      CancelButton,
      PrevButton: DisabledPrevButton,
      NextButton,
    },
    {
      name: 'sharing',
      label: t('label.sharing', 'SHARING'),
      icon: 'SignatureOutline',
      view: ResourceSharingSection,
      CancelButton,
      PrevButton,
      NextButton,
    },
    {
      name: 'create',
      label: t('label.create', 'CREATE'),
      icon: 'PowerOutline',
      view: ResourceCreateSection,
      CancelButton,
      PrevButton,
      NextButton: CreateButton,
    },
  ];

  return (
    <Container
      background="gray5"
      mainAlignment="flex-start"
      style={{
        position: 'absolute',
        top: '43px',
        right: '0px',
        bottom: '0px',
        left: 'max(calc(100% - 680px), 12px)',
        transition: 'left 0.2s ease-in-out',
        height: 'auto',
        width: 'auto',
        maxHeight: '100%',
        overflow: 'hidden',
        boxShadow: '-6px 4px 5px 0px rgba(0, 0, 0, 0.1)',
      }}
    >
      <ResourceFormContext.Provider value={{ form }}>
        <HorizontalWizard
          steps={wizardSteps}
          title={t('label.create_resource', 'Create Resource')}
          Wrapper={WizardInSection}
          onComplete={onClose}
          setToggleWizardSection={onClose}
        />
      </ResourceFormContext.Provider>
    </Container>
  );
};

export default CreateResource;
