/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, LabeledValue, ListRow, Row, Text } from '@zextras/ui-components';
import { FC, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceContext } from './resource-context';
import { SendInviteAccounts } from './send-invite-accounts';

const ResourceCreateSection: FC = () => {
  const context = useContext(ResourceContext);
  const { t } = useTranslation();
  const { resourceDetail, setResourceDetail } = context;

  const setSendInviteList = useCallback(
    (v: any) => {
      setResourceDetail((prev: any) => ({ ...prev, sendInviteList: v }));
    },
    [setResourceDetail],
  );

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
          <Text size="small" weight="bold">
            {t('label.details', 'Details')}
          </Text>
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
              value={resourceDetail?.displayName}
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
                value={resourceDetail?.name}
              />
            </Row>
            <Row width="10%" style={{ padding: '12px' }}>
              <icon-wc icon="AtOutline" color="gray0" size="large"></icon-wc>
            </Row>
            <Row width="45%">
              <LabeledValue
                label={t('label.domain', 'Domain')}
                backgroundColor="gray6"
                value={resourceDetail?.domain}
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
                value={resourceDetail?.zimbraCalResType?.label}
              />
            </Container>
            <Container padding={{ right: 'large' }}>
              <LabeledValue
                label={t('label.status', 'Status')}
                backgroundColor="gray6"
                value={resourceDetail?.zimbraAccountStatus?.label}
              />
            </Container>
            <Container>
              <LabeledValue
                label={t('label.class_of_service', 'Class of Service')}
                backgroundColor="gray6"
                value={resourceDetail?.zimbraCOSId?.label}
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
                value={resourceDetail?.zimbraCalResAutoDeclineRecurring?.label}
              />
            </Container>
            <Container padding={{ right: 'large' }}>
              <LabeledValue
                label={t('label.maximum_conflict', 'Maximum Conflict')}
                backgroundColor="gray6"
                value={resourceDetail.zimbraCalResMaxNumConflictsAllowed}
              />
            </Container>
            <Container>
              <LabeledValue
                label={t('label.percentage_maximum_conflict', '% Maximum Conflict')}
                backgroundColor="gray6"
                value={resourceDetail.zimbraCalResMaxPercentConflictsAllowed}
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
              value={resourceDetail?.schedulePolicyType?.label}
            />
          </Container>
        </ListRow>
        <Row width="100%" padding={{ top: 'medium' }}>
          <divider-wc color="gray3"></divider-wc>
        </Row>
        <SendInviteAccounts
          isEditable={false}
          sendInviteList={resourceDetail?.sendInviteList}
          setSendInviteList={setSendInviteList}
          hideSearchBar
        />
        <Row width="100%" padding={{ top: 'medium' }}>
          <divider-wc color="gray3"></divider-wc>
        </Row>
        <Row padding={{ top: 'large' }}>
          <Text size="small" weight="bold">
            {t('label.description', 'Description')}
          </Text>
        </Row>
        <ListRow>
          <Container
            mainAlignment="space-between"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <Row padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}>
              <Text size="small">{resourceDetail?.zimbraNotes}</Text>
            </Row>
          </Container>
        </ListRow>
      </Container>
    </Container>
  );
};

export default ResourceCreateSection;
