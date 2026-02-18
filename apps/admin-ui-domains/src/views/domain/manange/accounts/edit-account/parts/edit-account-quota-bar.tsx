/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Quota, Row, Text } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { noop } from 'lodash-es';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useTotalQuotaActive } from '../../../../../app/hooks/useTotalQuotaActive';
import { BytesToGB } from '../../../../../utility/utils';
import { AccountContext } from '../../account-context';

type EditAccountQuotaBarProps = {
  onClickMailboxQuota: () => void;
  onClickFilesQuota: () => void;
  onBarClick?: () => void;
};

const EditAccountQuotaBarLegacy = ({
  onClickMailboxQuota,
  onClickFilesQuota,
}: EditAccountQuotaBarProps): React.JSX.Element => {
  const isAdvanced = useIsAdvanced();
  const [t] = useTranslation();
  const context = useContext(AccountContext);
  const { initAccountDetail } = context;

  const showFilesQuota = isAdvanced && initAccountDetail.filesQuotaLimit !== undefined;

  const filesQuotaSize: string = useMemo(
    () =>
      initAccountDetail?.filesQuotaLimit > 0 &&
      initAccountDetail?.filesQuotaLimit < 9223372036854776000
        ? `${BytesToGB(initAccountDetail?.filesQuotaUsed).toFixed(2)} ${t(
            'label.of',
            'Of',
          )}  ${BytesToGB(initAccountDetail?.filesQuotaLimit).toFixed(2)} ${t('label.gb', 'GB')}`
        : `${BytesToGB(initAccountDetail?.filesQuotaUsed).toFixed(2)} ${t('label.of', 'Of')}  ${t(
            'label.unlimited',
            'unlimited',
          )}`,
    [initAccountDetail?.filesQuotaLimit, initAccountDetail?.filesQuotaUsed, t],
  );

  const mailboxQuotaSize: string = useMemo(
    () =>
      initAccountDetail?.zimbraMailQuota > 0
        ? `${BytesToGB(initAccountDetail?.mailboxQuotaUsed).toFixed(2)} ${t(
            'label.of',
            'Of',
          )}  ${BytesToGB(initAccountDetail?.zimbraMailQuota).toFixed(2)} ${t('label.gb', 'GB')}`
        : `${BytesToGB(initAccountDetail?.mailboxQuotaUsed).toFixed(2)} ${t('label.of', 'Of')}  ${t(
            'label.unlimited',
            'unlimited',
          )}`,
    [initAccountDetail?.mailboxQuotaUsed, initAccountDetail?.zimbraMailQuota, t],
  );

  const filesQuotaSizePercentage: number = useMemo(() => {
    if (!initAccountDetail?.filesQuotaLimit) {
      return 0;
    }
    if (initAccountDetail?.filesQuotaLimit == '9223372036854776000') {
      return 0;
    }
    return (initAccountDetail.filesQuotaUsed / initAccountDetail.filesQuotaLimit) * 100;
  }, [initAccountDetail?.filesQuotaLimit, initAccountDetail?.filesQuotaUsed]);

  const mailBoxQuotaSizePercentage: number = useMemo(() => {
    if (!initAccountDetail?.zimbraMailQuota) {
      return 0;
    }
    return (initAccountDetail.mailboxQuotaUsed / initAccountDetail.zimbraMailQuota) * 100;
  }, [initAccountDetail?.zimbraMailQuota, initAccountDetail?.mailboxQuotaUsed]);

  return (
    <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
      <Row
        width={showFilesQuota ? '49%' : '100%'}
        mainAlignment="space-between"
        onClick={onClickMailboxQuota}
      >
        <Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'small' }}>
          <Text size="extrasmall" color="secondary">
            {t('label.mailbox_space_usage', 'Mailbox Space Usage')}
          </Text>
        </Row>
        <Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'extrasmall' }}>
          <Text size="extrasmall" color="gray0">
            {mailboxQuotaSize}
          </Text>
        </Row>
        <Row mainAlignment="flex-start" width="100%">
          <Quota
            fill={mailBoxQuotaSizePercentage ?? 0}
            height="0.5rem"
            background="gray5"
            style={{ borderRadius: '2px' }}
          />
        </Row>
      </Row>

      {showFilesQuota && (
        <Row width={'49%'} mainAlignment="space-between" onClick={onClickFilesQuota}>
          <Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'small' }}>
            <Text size="extrasmall" color="secondary">
              {t('label.files_space_usage', 'Files Space Usage')}
            </Text>
          </Row>
          <Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'extrasmall' }}>
            <Text size="extrasmall" color="gray0">
              {filesQuotaSize}
            </Text>
          </Row>
          <Row mainAlignment="flex-start" width="100%">
            <Quota
              fill={filesQuotaSizePercentage ?? 0}
              height="0.5rem"
              background="gray5"
              style={{ borderRadius: '2px' }}
            />
          </Row>
        </Row>
      )}
    </Row>
  );
};

export const EditAccountQuotaBar = ({
  onClickMailboxQuota,
  onClickFilesQuota,
  onBarClick,
}: EditAccountQuotaBarProps): React.JSX.Element | null => {
  const isAdvanced = useIsAdvanced();
  const [t] = useTranslation();
  const context = useContext(AccountContext);
  const { initAccountDetail } = context;
  const isTotalQuotaActive = useTotalQuotaActive();

  const usedGB = BytesToGB(initAccountDetail?.filesQuotaUsed).toFixed(2);
  const limitGB = BytesToGB(initAccountDetail?.filesQuotaLimit).toFixed(2);

  const percentage: number = useMemo(() => {
    if (!initAccountDetail?.filesQuotaLimit) {
      return 0;
    }

    return (initAccountDetail.filesQuotaUsed / initAccountDetail.filesQuotaLimit) * 100;
  }, [initAccountDetail?.filesQuotaLimit, initAccountDetail?.filesQuotaUsed]);

  const sizeDescription = useMemo<string>(() => {
    return t('label.account_quota_usage', {
      used: usedGB,
      limit: limitGB,
      defaultValue: '{{used}} GB of {{limit}} GB',
    });
  }, [limitGB, t, usedGB]);

  if (!isAdvanced) {
    return null;
  }

  if (!isTotalQuotaActive) {
    return (
      <EditAccountQuotaBarLegacy
        onClickMailboxQuota={onClickMailboxQuota}
        onClickFilesQuota={onClickFilesQuota}
      />
    );
  }

  return (
    <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
      <Row width={'100%'} mainAlignment="space-between" onClick={onBarClick ? onBarClick : noop}>
        <Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'small' }}>
          <Text size="extrasmall" color="secondary">
            {t('label.total_quota_usage', 'Total Quota Usage')}
          </Text>
        </Row>
        <Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'extrasmall' }}>
          <Text size="extrasmall" color="gray0">
            {sizeDescription}
          </Text>
        </Row>
        <Row mainAlignment="flex-start" width="100%">
          <Quota
            fill={percentage}
            height="0.5rem"
            background="gray5"
            style={{ borderRadius: '2px' }}
          />
        </Row>
      </Row>
    </Row>
  );
};
