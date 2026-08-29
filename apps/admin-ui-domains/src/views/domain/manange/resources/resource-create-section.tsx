/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, LabeledValue, ListRow, Row } from '@zextras/ui-components';
import { useCosList } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import {
  RESOURCE_TYPE,
  SCHEDULE_POLICY_TYPE,
  STATUS,
  TRUE_FALSE,
} from './resource-edit-detail-view';
import { useResourceForm } from './resource-form-context';
import { SendInviteAccounts } from './send-invite-accounts';

export const ResourceCreateSection = () => {
  const form = useResourceForm();
  const { t } = useTranslation();
  const { data: cosData } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const cosList = cosData?.cos ?? [];

  const displayName = useSelector(form.store, (s) => s.values.displayName);
  const name = useSelector(form.store, (s) => s.values.name);
  const { data: domainData } = useSelectedDomain();
  const domainName = domainData?.name ?? '';
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
  const sendInviteList = useSelector(form.store, (s) => s.values.sendInviteList);

  const resourceTypeLabel =
    zimbraCalResType === RESOURCE_TYPE.LOCATION
      ? t('label.meeting_room', 'Meeting Room')
      : t('label.equipment', 'Equipment');

  const accountStatusLabel =
    zimbraAccountStatus === STATUS.ACTIVE
      ? t('label.active', 'Active')
      : t('label.closed', 'Closed');

  const autoRefuseLabel =
    zimbraCalResAutoDeclineRecurring === TRUE_FALSE.TRUE
      ? t('label.yes', 'Yes')
      : t('label.no', 'No');

  const schedulePolicyLabels: Record<number, string> = {
    [SCHEDULE_POLICY_TYPE.AUTO_ACCEPT]: t(
      'label.auto_accept_auto_decline_on_conflict',
      'Automatic acceptance if available, automatic rejection in case of conflict',
    ),
    [SCHEDULE_POLICY_TYPE.MANUAL_ACCEPT]: t(
      'label.manual_accept_auto_decline_on_conflict',
      'Handle acceptance, automatic rejection in case of conflict',
    ),
    [SCHEDULE_POLICY_TYPE.AUTO_ACCEPT_ALWAYS]: t(
      'label.auto_accept_always',
      'Automatic acceptance if available always',
    ),
    [SCHEDULE_POLICY_TYPE.NO_AUTO_ACCEPT]: t(
      'label.no_auto_accept_or_decline',
      'No automatic acceptance if available always',
    ),
  };
  const schedulePolicyLabel = schedulePolicyLabels[schedulePolicyType] ?? '';

  const cosLabel = zimbraCOSId
    ? (cosList.find((c: { id: string; name: string }) => c.id === zimbraCOSId)?.name ?? zimbraCOSId)
    : t('label.auto', 'Auto');

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
            <LabeledValue
              label={t('label.resource_name', 'ResourceName')}
              backgroundColor="gray6"
              value={displayName}
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
              <LabeledValue
                label={t('label.name', 'Name')}
                backgroundColor="gray6"
                value={name}
              />
            </Row>
            <Row width="10%" style={{ padding: '12px' }}>
              <ds-icon icon="AtOutline" color="gray0" size="large"></ds-icon>
            </Row>
            <Row width="45%">
              <LabeledValue
                label={t('label.domain', 'Domain')}
                backgroundColor="gray6"
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
              <LabeledValue
                label={t('label.type', 'Type')}
                backgroundColor="gray6"
                value={resourceTypeLabel}
              />
            </Container>
            <Container padding={{ right: 'large' }}>
              <LabeledValue
                label={t('label.status', 'Status')}
                backgroundColor="gray6"
                value={accountStatusLabel}
              />
            </Container>
            <Container>
              <LabeledValue
                label={t('label.class_of_service', 'Class of Service')}
                backgroundColor="gray6"
                value={cosLabel}
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
              <LabeledValue
                label={t('label.auto_refuse', 'Auto-Refuse')}
                backgroundColor="gray6"
                value={autoRefuseLabel}
              />
            </Container>
            <Container padding={{ right: 'large' }}>
              <LabeledValue
                label={t('label.maximum_conflict', 'Maximum Conflict')}
                backgroundColor="gray6"
                value={zimbraCalResMaxNumConflictsAllowed}
              />
            </Container>
            <Container>
              <LabeledValue
                label={t('label.percentage_maximum_conflict', '% Maximum Conflict')}
                backgroundColor="gray6"
                value={zimbraCalResMaxPercentConflictsAllowed}
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
            <LabeledValue
              label={t('label.schedule_policy', 'Set Policy')}
              backgroundColor="gray6"
              value={schedulePolicyLabel}
            />
          </Container>
        </ListRow>
        <Row width="100%" padding={{ top: 'medium' }}>
          <ds-divider color="gray3"></ds-divider>
        </Row>
        <SendInviteAccounts
          isEditable={false}
          sendInviteList={sendInviteList}
          setSendInviteList={(v) => form.setFieldValue('sendInviteList', v)}
          hideSearchBar
        />
        <Row width="100%" padding={{ top: 'medium' }}>
          <ds-divider color="gray3"></ds-divider>
        </Row>
        <Row padding={{ top: 'large' }}>
          <ds-text as="h3" size="small" weight="bold">
            {t('label.description', 'Description')}
          </ds-text>
        </Row>
        <ListRow>
          <Container
            mainAlignment="space-between"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <Row padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}>
              <ds-text as="p" size="small">
                {zimbraNotes}
              </ds-text>
            </Row>
          </Container>
        </ListRow>
      </Container>
    </Container>
  );
};

export default ResourceCreateSection;
