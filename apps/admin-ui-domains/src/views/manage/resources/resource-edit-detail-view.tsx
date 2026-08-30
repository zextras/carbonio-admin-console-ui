/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  CustomTextArea,
  Displayer,
  Input,
  LabeledValue,
  ListRow,
  Padding,
  RouteLeavingGuard,
  Row,
  Select,
  useSnackbar,
} from '@zextras/ui-components';
import { useCosList, useStickyBarStore } from '@zextras/ui-shared';
import { format, parse } from 'date-fns';
import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useCalResource,
  useDelegateAuth,
  useSaveCalResource,
} from '../../../services/use-cal-resource';
import { ResourceDeleteDialog } from './resource-delete-dialog';
import { SendInviteAccounts } from './send-invite-accounts';

export const RESOURCE_TYPE = {
  LOCATION: 'Location',
  EQUIPMENT: 'Equipment',
} as const;

export const TRUE_FALSE = {
  TRUE: 'TRUE',
  FALSE: 'FALSE',
} as const;

export const STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
} as const;

export const SCHEDULE_POLICY_TYPE = {
  AUTO_ACCEPT: 1,
  MANUAL_ACCEPT: 2,
  AUTO_ACCEPT_ALWAYS: 3,
  NO_AUTO_ACCEPT: 4,
} as const;

type ResourceAttribute = { n: string; _content: string };

type ResourceEntry = {
  id: string;
  name: string;
  a?: Array<ResourceAttribute>;
};

type SendInviteItem = { id: string; n: string; _content: string };

type ResourceEditDetailViewProps = {
  selectedResource: ResourceEntry;
  onClose: () => void;
};

function attributeMap(attrs: Array<ResourceAttribute> | undefined): Record<string, string> {
  if (!attrs) return {};
  const obj: Record<string, string> = {};
  attrs.forEach((a) => {
    obj[a.n] = a._content;
  });
  return obj;
}

function resolveSchedulePolicy(
  autoAccept: string | undefined,
  autoDeclineIfBusy: string | undefined,
): number {
  if (autoAccept === 'TRUE' && autoDeclineIfBusy === 'TRUE') return SCHEDULE_POLICY_TYPE.AUTO_ACCEPT;
  if (autoAccept === 'FALSE' && autoDeclineIfBusy === 'TRUE') return SCHEDULE_POLICY_TYPE.MANUAL_ACCEPT;
  if (autoAccept === 'TRUE' && autoDeclineIfBusy === 'FALSE')
    return SCHEDULE_POLICY_TYPE.AUTO_ACCEPT_ALWAYS;
  return SCHEDULE_POLICY_TYPE.NO_AUTO_ACCEPT;
}

type ResourceFormValues = {
  displayName: string;
  mail: string;
  zimbraCalResType: string;
  zimbraAccountStatus: string;
  zimbraCalResAutoDeclineRecurring: string;
  zimbraCOSId: string;
  zimbraCalResMaxNumConflictsAllowed: string;
  zimbraCalResMaxPercentConflictsAllowed: string;
  zimbraNotes: string;
  schedulePolicyType: number;
  password: string;
  repeatPassword: string;
};

function buildFormDefaults(
  attrs: Record<string, string>,
  fallbackMail: string,
): ResourceFormValues {
  return {
    displayName: attrs.displayName ?? '',
    mail: attrs.mail ?? fallbackMail,
    zimbraCalResType: attrs.zimbraCalResType ?? RESOURCE_TYPE.LOCATION,
    zimbraAccountStatus: attrs.zimbraAccountStatus ?? STATUS.ACTIVE,
    zimbraCalResAutoDeclineRecurring: attrs.zimbraCalResAutoDeclineRecurring ?? TRUE_FALSE.FALSE,
    zimbraCOSId: attrs.zimbraCOSId ?? '',
    zimbraCalResMaxNumConflictsAllowed: attrs.zimbraCalResMaxNumConflictsAllowed ?? '',
    zimbraCalResMaxPercentConflictsAllowed: attrs.zimbraCalResMaxPercentConflictsAllowed ?? '',
    zimbraNotes: attrs.zimbraNotes ?? '',
    schedulePolicyType: resolveSchedulePolicy(
      attrs.zimbraCalResAutoAcceptDecline,
      attrs.zimbraCalResAutoDeclineIfBusy,
    ),
    password: '',
    repeatPassword: '',
  };
}

function extractInviteItems(attrs: Array<ResourceAttribute> | undefined): Array<SendInviteItem> {
  return (attrs ?? [])
    .filter((a) => a.n === 'zimbraPrefCalendarForwardInvitesTo')
    .map((a, idx) => ({
      id: idx.toString(),
      n: a.n,
      _content: a._content,
    }));
}

export const ResourceEditDetailView = ({
  selectedResource,
  onClose,
}: ResourceEditDetailViewProps) => {
  const { data: rawResource, isPending } = useCalResource(selectedResource.id);

  if (isPending || !rawResource) {
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
        <Container crossAlignment="center" mainAlignment="center" height="100%">
          <ds-spinner></ds-spinner>
        </Container>
      </Container>
    );
  }

  return (
    <ResourceEditForm
      key={rawResource.id}
      selectedResource={selectedResource}
      rawResource={rawResource}
      onClose={onClose}
    />
  );
};

type ResourceEditFormProps = {
  selectedResource: ResourceEntry;
  rawResource: ResourceEntry;
  onClose: () => void;
};

const ResourceEditForm = ({
  selectedResource,
  rawResource,
  onClose,
}: ResourceEditFormProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { isSticky, setIsSticky } = useStickyBarStore();
  const { data: cosData } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const cosList = cosData?.cos ?? [];

  const saveResource = useSaveCalResource(selectedResource.id);
  const delegateAuth = useDelegateAuth();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [defaultValues, setDefaultValues] = useState(() =>
    buildFormDefaults(attributeMap(rawResource.a), selectedResource.name ?? ''),
  );
  const [sendInviteList, setSendInviteList] = useState(() => extractInviteItems(rawResource.a));
  const [originalSendInviteList, setOriginalSendInviteList] = useState(() =>
    extractInviteItems(rawResource.a),
  );

  const attrs = attributeMap(rawResource.a);
  const cosItems = [
    { label: t('label.auto', 'Auto'), value: '' },
    ...cosList.map((c: { id: string; name: string }) => ({ label: c.name, value: c.id })),
  ];

  const resourceTypeOptions = [
    { label: t('label.meeting_room', 'Meeting Room'), value: RESOURCE_TYPE.LOCATION },
    { label: t('label.equipment', 'Equipment'), value: RESOURCE_TYPE.EQUIPMENT },
  ];

  const accountStatusOptions = [
    { label: t('label.active', 'Active'), value: STATUS.ACTIVE },
    { label: t('label.closed', 'Closed'), value: STATUS.CLOSED },
  ];

  const autoRefuseOptions = [
    { label: t('label.yes', 'Yes'), value: TRUE_FALSE.TRUE },
    { label: t('label.no', 'No'), value: TRUE_FALSE.FALSE },
  ];

  const schedulePolicyOptions = [
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

  const form = useForm({
    defaultValues,
    onSubmit: async () => {},
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);
  const currentValues = useSelector(form.store, (s) => s.values);
  const sendInviteDirty =
    JSON.stringify(sendInviteList) !== JSON.stringify(originalSendInviteList);
  const isFormDirty = isDirty || sendInviteDirty;

  function handleSave(): void {
    if (currentValues.password && currentValues.password.length < 6) {
      createSnackbar({
        key: 'pw-short',
        severity: 'error',
        label: t('label.password_length_msg', 'Password should be more than 5 characters'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      return;
    }
    if (currentValues.password !== currentValues.repeatPassword) {
      createSnackbar({
        key: 'pw-mismatch',
        severity: 'error',
        label: t('label.password_and_repeat_password_not_match', 'Passwords do not match'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      return;
    }

    const schedulePolicyValue = currentValues.schedulePolicyType;
    const attributes: Array<{ n: string; _content: string }> = [
      { n: 'displayName', _content: currentValues.displayName },
      { n: 'zimbraNotes', _content: currentValues.zimbraNotes },
      {
        n: 'zimbraCalResMaxNumConflictsAllowed',
        _content: currentValues.zimbraCalResMaxNumConflictsAllowed,
      },
      {
        n: 'zimbraCalResMaxPercentConflictsAllowed',
        _content: currentValues.zimbraCalResMaxPercentConflictsAllowed,
      },
      { n: 'zimbraCOSId', _content: currentValues.zimbraCOSId },
      { n: 'zimbraCalResType', _content: currentValues.zimbraCalResType },
      { n: 'zimbraAccountStatus', _content: currentValues.zimbraAccountStatus },
      {
        n: 'zimbraCalResAutoDeclineRecurring',
        _content: currentValues.zimbraCalResAutoDeclineRecurring,
      },
      {
        n: 'zimbraCalResAutoAcceptDecline',
        _content:
          schedulePolicyValue === SCHEDULE_POLICY_TYPE.AUTO_ACCEPT ||
          schedulePolicyValue === SCHEDULE_POLICY_TYPE.AUTO_ACCEPT_ALWAYS
            ? 'TRUE'
            : 'FALSE',
      },
      {
        n: 'zimbraCalResAutoDeclineIfBusy',
        _content:
          schedulePolicyValue === SCHEDULE_POLICY_TYPE.AUTO_ACCEPT ||
          schedulePolicyValue === SCHEDULE_POLICY_TYPE.MANUAL_ACCEPT
            ? 'TRUE'
            : 'FALSE',
      },
      ...sendInviteList.map((item) => ({
        n: 'zimbraPrefCalendarForwardInvitesTo',
        _content: item._content,
      })),
    ];

    saveResource.mutate(
      {
        resourceId: selectedResource.id,
        currentMail: attrs.mail ?? selectedResource.name,
        newMail: currentValues.mail,
        password: currentValues.password,
        attributes,
      },
      {
        onSuccess: () => {
          const savedValues = {
            ...currentValues,
            password: '',
            repeatPassword: '',
          };
          setDefaultValues(savedValues);
          form.reset(savedValues);
          setOriginalSendInviteList([...sendInviteList]);
        },
      },
    );
  }

  function handleCancel(): void {
    form.reset();
    setSendInviteList([...originalSendInviteList]);
  }

  const currentStatus =
    currentValues.zimbraAccountStatus ?? attrs.zimbraAccountStatus ?? STATUS.ACTIVE;

  const buttons = [
    {
      align: 'right' as const,
      label: t('label.view_mail', 'VIEW MAIL'),
      color: 'primary',
      onClick: () => delegateAuth.mutate(selectedResource.id),
    },
    {
      align: 'right' as const,
      type: 'outlined' as const,
      color: 'error',
      onClick: () => setShowDeleteDialog(true),
      label: t('label.delete', 'delete'),
    },
    {
      align: 'left' as const,
      icon: isSticky ? 'Pin3Outline' : 'Unpin3Outline',
      onClick: () => setIsSticky(!isSticky),
    },
  ];

  const selectedCosItem =
    cosItems.find((c) => c.value === currentValues.zimbraCOSId) ?? cosItems[0];
  const selectedResourceType =
    resourceTypeOptions.find((o) => o.value === currentValues.zimbraCalResType) ??
    resourceTypeOptions[0];
  const selectedStatus =
    accountStatusOptions.find((o) => o.value === currentValues.zimbraAccountStatus) ??
    accountStatusOptions[0];
  const selectedAutoRefuse =
    autoRefuseOptions.find((o) => o.value === currentValues.zimbraCalResAutoDeclineRecurring) ??
    autoRefuseOptions[1];
  const selectedSchedulePolicy =
    schedulePolicyOptions.find((o) => o.value === currentValues.schedulePolicyType) ??
    schedulePolicyOptions[0];

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
      <Row
        mainAlignment="flex-start"
        crossAlignment="center"
        orientation="horizontal"
        background="white"
        width="fill"
        height="56px"
      >
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
            {selectedResource.name}
          </ds-text>
        </Row>
        <Row>
          {isFormDirty && (
            <Container
              orientation="horizontal"
              mainAlignment="flex-end"
              crossAlignment="flex-end"
              background="gray6"
            >
              <Padding right="large">
                <Button
                  label={t('label.cancel', 'Cancel')}
                  color="secondary"
                  onClick={handleCancel}
                />
              </Padding>
              <Button
                label={t('label.save', 'Save')}
                color="primary"
                onClick={handleSave}
                disabled={saveResource.isPending}
              />
            </Container>
          )}
        </Row>
        <Row padding={{ right: 'extrasmall', left: 'small' }}>
          <Button
            type="ghost"
            color="text"
            size="medium"
            icon="CloseOutline"
            aria-label={t('label.close', 'Close')}
            onClick={onClose}
          />
        </Row>
      </Row>
      <Row>
        <ds-divider color="gray3"></ds-divider>
      </Row>

      <Container
        padding={{ left: 'large', right: 'large' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100% - 64px)"
        background="white"
        style={{ overflow: 'auto' }}
      >
          <>
            <Displayer buttons={buttons} pinIcon={isSticky} />
            <Row>
              <ds-text as="h3" size="small" weight="bold">
                {t('label.resource', 'Resource')}
              </ds-text>
            </Row>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%" padding={{ right: 'small' }}>
                  <form.Field name="displayName">
                    {(field) => (
                      <Input
                        isRequired
                        label={t('label.name', 'Name')}
                        backgroundColor="gray5"
                        value={field.state.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
              <Container
                mainAlignment="flex-end"
                crossAlignment="center"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%" padding={{ left: 'small' }}>
                  <form.Field name="mail">
                    {(field) => (
                      <Input
                        isRequired
                        label={t('label.email', 'Email')}
                        backgroundColor="gray5"
                        value={field.state.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
            </ListRow>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%" padding={{ right: 'small' }}>
                  <LabeledValue
                    label={t('label.server', 'Server')}
                    backgroundColor="gray6"
                    value={attrs.zimbraMailHost}
                  />
                </Row>
              </Container>
              <Container
                mainAlignment="flex-end"
                crossAlignment="center"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%" padding={{ left: 'small' }}>
                  <form.Field name="zimbraCalResType">
                    {(field) => (
                      <Select
                        items={resourceTypeOptions}
                        background="gray5"
                        label={t('label.type', 'Type')}
                        showCheckbox={false}
                        onChange={(v) => { if (v !== null) field.handleChange(v); }}
                        selection={selectedResourceType}
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
            </ListRow>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%" padding={{ right: 'small' }}>
                  <form.Field name="zimbraAccountStatus">
                    {(field) => (
                      <Select
                        items={accountStatusOptions}
                        background="gray5"
                        label={t('label.status', 'Status')}
                        showCheckbox={false}
                        onChange={(v) => { if (v !== null) field.handleChange(v); }}
                        selection={selectedStatus}
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
              <Container
                mainAlignment="flex-end"
                crossAlignment="center"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%" padding={{ left: 'small' }}>
                  <form.Field name="zimbraCOSId">
                    {(field) => (
                      <Select
                        items={cosItems}
                        background="gray5"
                        label={t('label.class_of_service', 'Class of Service')}
                        showCheckbox={false}
                        onChange={(v) => { if (v !== null) field.handleChange(v); }}
                        selection={selectedCosItem}
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
            </ListRow>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%">
                  <form.Field name="zimbraCalResAutoDeclineRecurring">
                    {(field) => (
                      <Select
                        items={autoRefuseOptions}
                        background="gray5"
                        label={t('label.auto_refuse', 'Auto-Refuse')}
                        showCheckbox={false}
                        onChange={(v) => { if (v !== null) field.handleChange(v); }}
                        selection={selectedAutoRefuse}
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
            </ListRow>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%">
                  <form.Field name="schedulePolicyType">
                    {(field) => (
                      <Select
                        items={schedulePolicyOptions}
                        background="gray5"
                        label={t('label.schedule_policy', 'Set Policy')}
                        showCheckbox={false}
                        onChange={(v) => { if (v !== null) field.handleChange(v); }}
                        selection={selectedSchedulePolicy}
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
            </ListRow>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%" padding={{ right: 'small' }}>
                  <form.Field name="zimbraCalResMaxNumConflictsAllowed">
                    {(field) => (
                      <Input
                        label={t('label.maximum_conflict_allowed', 'Maximum Conflict Allowed')}
                        backgroundColor="gray5"
                        value={field.state.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
              <Container
                mainAlignment="flex-end"
                crossAlignment="center"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%" padding={{ left: 'small' }}>
                  <form.Field name="zimbraCalResMaxPercentConflictsAllowed">
                    {(field) => (
                      <Input
                        label={t(
                          'label.percentage_maximum_conflict_allowed',
                          '% Maximum Conflict Allowed',
                        )}
                        backgroundColor="gray5"
                        value={field.state.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
            </ListRow>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%" padding={{ right: 'small' }}>
                  <LabeledValue
                    label={t('label.id_lbl', 'ID')}
                    backgroundColor="gray6"
                    value={selectedResource.id}
                  />
                </Row>
              </Container>
              <Container
                mainAlignment="flex-end"
                crossAlignment="center"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%" padding={{ left: 'small' }}>
                  <LabeledValue
                    label={t('label.creation_date', 'Creation Date')}
                    backgroundColor="gray6"
                    value={
                      attrs.zimbraCreateTimestamp
                        ? format(
                            parse(
                              attrs.zimbraCreateTimestamp,
                              'yyyyMMddHHmmss.SSSX',
                              new Date(),
                            ),
                            'dd MMM yyyy | hh:mm:ss a',
                          )
                        : '--'
                    }
                  />
                </Row>
              </Container>
            </ListRow>

            <Row width="100%" padding={{ top: 'medium' }}>
              <ds-divider color="gray3"></ds-divider>
            </Row>
            <Row padding={{ top: 'extralarge' }}>
              <ds-text as="h3" size="small" weight="bold">
                {t('label.password', 'Password')}
              </ds-text>
            </Row>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%">
                  <form.Field name="password">
                    {(field) => (
                      <Input
                        isRequired
                        label={t('label.password', 'Password')}
                        backgroundColor="gray5"
                        value={field.state.value}
                        inputName="password"
                        type="password"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
            </ListRow>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'large' }}
              >
                <Row width="100%">
                  <form.Field name="repeatPassword">
                    {(field) => (
                      <Input
                        isRequired
                        label={t('label.repeat_password', 'Repeat Password')}
                        backgroundColor="gray5"
                        value={field.state.value}
                        inputName="repeatPassword"
                        type="password"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                      />
                    )}
                  </form.Field>
                </Row>
              </Container>
            </ListRow>

            <Row width="100%" padding={{ top: 'medium' }}>
              <ds-divider color="gray3"></ds-divider>
            </Row>
            <SendInviteAccounts
              isEditable
              sendInviteList={sendInviteList}
              setSendInviteList={setSendInviteList}
            />
            <Row width="100%" padding={{ top: 'medium' }}>
              <ds-divider color="gray3"></ds-divider>
            </Row>

            <Row padding={{ top: 'extralarge' }} width="100%">
              <form.Field name="zimbraNotes">
                {(field) => (
                  <CustomTextArea
                    label={t('label.description', 'Description')}
                    backgroundColor="gray5"
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                  />
                )}
              </form.Field>
            </Row>
          </>
      </Container>

      {showDeleteDialog && (
        <ResourceDeleteDialog
          resourceId={selectedResource.id}
          resourceName={selectedResource.name}
          isAccountClosed={currentStatus === STATUS.CLOSED}
          onClose={() => setShowDeleteDialog(false)}
          onDeleted={() => {
            setShowDeleteDialog(false);
            onClose();
          }}
        />
      )}
      <RouteLeavingGuard when={isFormDirty} onSave={handleSave} />
    </Container>
  );
};
