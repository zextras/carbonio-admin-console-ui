/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, LabeledValue, Quota, Row, Tooltip } from '@zextras/ui-components';
import { type LicenseInfo } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { DATE_FORMAT, TIME_FORMAT } from '../constants';

type Module = {
  value: string;
  label: string;
};
export type AllModuleConfig = {
  name: Module;
  quantity: string;
  enabled: boolean;
};

function getTypeDisplayValue(response: LicenseInfo | undefined): string {
  if (!response) return '';
  const { type, subType } = response;

  if (type === 'Purchased') {
    if (subType === 'PERPETUAL' || subType === 'REGULAR') {
      return `${type} - ${subType}`;
    }
    return subType ?? '';
  }
  return type ?? '';
}

type SubscriptionDetailsProps = {
  readonly response: LicenseInfo | undefined;
  readonly version: string | undefined;
  readonly accountQuotaPercentage: number;
};

export const SubscriptionDetails = ({
  response,
  version,
  accountQuotaPercentage,
}: SubscriptionDetailsProps) => {
  const { t } = useTranslation();

  if (!response) {
    return null;
  }

  return (
    <Container
      orientation="horizontal"
      width="100%"
      height="fit"
      wrap="wrap"
      mainAlignment="flex-start"
      crossAlignment="flex-start"
    >
      <Row
        width="49.5%"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'small', right: 'small' }}
      >
        <LabeledValue
          label={t('core.subscription.company_name', 'Company Name')}
          value={response.endUser || ''}
        />
      </Row>
      <Row
        width="49.5%"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'small', right: 'small' }}
      >
        <LabeledValue
          label={t('core.subscription.provider', 'Provider')}
          value={response.customer}
        />
      </Row>
      <Row
        width="49.5%"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'small', right: 'small' }}
      >
        <LabeledValue
          label={t('core.subscription.type', 'Type')}
          value={getTypeDisplayValue(response)}
        />
      </Row>
      <Row
        width="49.5%"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'small', right: 'small' }}
      >
        <LabeledValue
          label={t('core.subscription.order_id', 'Order ID')}
          value={response.infrastructureId ?? ''}
        />
      </Row>
      <Row
        width="49.5%"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'small', right: 'small' }}
      >
        <LabeledValue
          label={t('core.subscription.date_start', 'Date Start')}
          value={response.dateStart ? format(response.dateStart, DATE_FORMAT) : ''}
        />
      </Row>
      <Row
        width="49.5%"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'small', right: 'small' }}
      >
        <LabeledValue
          label={t('core.subscription.date_end', 'Date End')}
          value={
            response.notYetValid || !response.authenticationToken || !response.dateEnd
              ? ''
              : format(response.dateEnd, DATE_FORMAT)
          }
        />
      </Row>
      {response.maintenanceEndDate && (
        <Row
          width="99%"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ top: 'small', bottom: 'small', right: 'small' }}
        >
          <LabeledValue
            label={t('core.subscription.maintenance_end_date', 'Maintenance End Date')}
            value={format(response.maintenanceEndDate, DATE_FORMAT)}
          />
        </Row>
      )}
      {response.type === 'ISP' && (
        <Row
          width="49.5%"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ top: 'small', bottom: 'small', right: 'small' }}
        >
          <Tooltip
            label={
              <ds-text as="p" style={{ whiteSpace: 'pre-line' }}>
                {t(
                  'core.subscription.last_validation_check_tooltip',
                  'This date represents the last day on which the license was validated by the Zextras Subscription Service.\n\nSince this is a Pay Per Use (PPU) subscription, the system automatically reports daily usage data to the Zextras Subscription Service. No user action is required as long as communication is functioning correctly. If the system is unable to contact the service, a 7-day grace period is applied. This grace period is automatically renewed each time the Zextras Subscription Service is successfully contacted.',
                )}
              </ds-text>
            }
          >
            <LabeledValue
              label={t('core.subscription.last_validation_check', 'Last Validation Check')}
              value={
                response.lastValidationCheck
                  ? format(response.lastValidationCheck, DATE_FORMAT)
                  : ''
              }
            />
          </Tooltip>
        </Row>
      )}
      {response.type === 'ISP' && (
        <Row
          width="49.5%"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ top: 'small', bottom: 'small', right: 'small' }}
        >
          <Tooltip
            label={
              <ds-text as="p" style={{ whiteSpace: 'pre-line' }}>
                {t(
                  'core.subscription.next_validation_deadline_tooltip',
                  'This date represents the last day the license will remain fully functional if usage data is not sent to the Zextras Subscription Service.\n\nSince this is a Pay Per Use (PPU) subscription, the system automatically reports daily usage data to the Zextras Subscription Service. No user action is required as long as communication is functioning correctly. If the system is unable to contact the service, a 7-day grace period is applied. This grace period is automatically renewed each time the Zextras Subscription Service is successfully contacted.',
                )}
              </ds-text>
            }
          >
            <LabeledValue
              label={t('core.subscription.next_validation_deadline', 'Next Validation Deadline')}
              value={
                response.nextValidationDeadline
                  ? format(response.nextValidationDeadline, DATE_FORMAT)
                  : ''
              }
            />
          </Tooltip>
        </Row>
      )}
      <Row
        width="49.5%"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'small', right: 'small' }}
      >
        <LabeledValue label={t('core.subscription.version', 'Module Version')} value={version} />
      </Row>
      <Row
        width="49.5%"
        orientation="vertical"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'large', right: 'small' }}
        style={{ gap: '.5rem' }}
      >
        <ds-text as="span" size="small" color="#828282">
          {t('core.subscription.accounts', 'Accounts')}
        </ds-text>
        <Row
          orientation="vertical"
          width="100%"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
        >
          <ds-text
            as="span"
            size="small"
          >{`${response.accountCount} / ${response.licensedUsers}`}</ds-text>
          <Quota
            fill={accountQuotaPercentage}
            background="#F5F6F8"
            fillBackground="#2B73D2"
            style={{ borderRadius: '2px' }}
          />
        </Row>
      </Row>
      {response.subType === 'PERPETUAL' && response.maxCarbonioVersion && (
        <Row
          width="49.5%"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ top: 'small', bottom: 'small', right: 'small' }}
        >
          <LabeledValue
            label={t('core.subscription.maxCarbonioVersion', 'Max Carbonio Version')}
            value={response.maxCarbonioVersion}
          />
        </Row>
      )}
      {response.updateTime && (
        <Row
          width="49.5%"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ top: 'small', bottom: 'small', right: 'small' }}
        >
          <LabeledValue
            label={t('core.subscription.updateTime', 'Update Time')}
            value={format(response.updateTime, TIME_FORMAT)}
          />
        </Row>
      )}
    </Container>
  );
};
