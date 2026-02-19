/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Quota, Row, Text } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useTotalQuotaActive } from '../../../../../app/hooks/useTotalQuotaActive';
import { BytesToGB } from '../../../../../utility/utils';
import { AccountContext } from '../../account-context';
import { QuotaBar, QuotaBarEntry } from './quota-bar';
import { getPercentage, humanFileSize } from './size-utils';

type EditAccountQuotaBarProps = {
  onClickMailboxQuota: () => void;
  onClickFilesQuota: () => void;
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
}: EditAccountQuotaBarProps): React.JSX.Element | null => {
  const isAdvanced = useIsAdvanced();
  const [t] = useTranslation();
  const context = useContext(AccountContext);
  const { initAccountDetail } = context;
  const isTotalQuotaActive = useTotalQuotaActive();

  const used = initAccountDetail?.totalQuotaUsed ?? 0;
  const limit = initAccountDetail?.totalComputedQuotaLimit ?? 0;
  const usedByModule = initAccountDetail?.totalQuotaUsedByModule ?? {
    mailbox: 0,
    wsc: 0,
    files: 0,
  };

  const quotaModules: QuotaBarEntry[] = useMemo(
    () => [
      {
        label: t('quota.module.mailbox', 'Mails, Calendars, Contacts'),
        color: '#10789F',
        used: usedByModule.mailbox,
      },
      {
        label: t('quota.module.wsc', 'Chats'),
        color: '#FD830B',
        used: usedByModule.wsc,
      },
      {
        label: t('quota.module.files', 'Files'),
        color: '#2EAF96',
        used: usedByModule.files,
      },
    ],
    [t, usedByModule.mailbox, usedByModule.wsc, usedByModule.files],
  );

  const sizeDescription = useMemo<string>(() => {
    return t('label.account_quota_usage', {
      used: humanFileSize(used, t),
      limit: humanFileSize(limit, t),
      percentage: getPercentage(used, limit),
      defaultValue: '{{used}} of {{limit}} ({{percentage}}%)',
    });
  }, [t, used, limit]);

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
    <Container mainAlignment="flex-start" height="fit" crossAlignment="flex-start" gap="0.5rem">
      <Container orientation="horizontal" width={'100%'} mainAlignment="space-between">
        <Text size="medium" weight="bold" color="regular">
          {t('label.storage_usage', 'Storage usage')}
        </Text>
        <Text size="small" color="regular">
          {sizeDescription}
        </Text>
      </Container>

      <QuotaBar modules={quotaModules} limit={limit} used={used} />
    </Container>
  );
};
