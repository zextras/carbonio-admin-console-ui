/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, useSnackbar } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { TFunction } from 'i18next';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BYTE_PER_MB } from '../../../constants';
import { getQuotaUsageAdvance } from '../../../services/get-file-quota-accounts-usage';
import { getQuotaUsage } from '../../../services/get-quota-usage-service';
import DownloadCSV from '../../app/shared/download-csv';
import { MailBoxQuota } from '../../app/types/mailbox_quota';
import { BytesToGB } from '../../utility/utils';

const formatQuota = (quotaUsed: number, quotaLimit: number, t: TFunction): [string, number] => {
  if (quotaLimit === 0) {
    return [t('label.unlimited', 'Unlimited'), 0];
  }
  if (quotaLimit >= BYTE_PER_MB) {
    return [BytesToGB(quotaLimit), (quotaUsed / quotaLimit) * 100];
  }
  return ['1', (quotaUsed / quotaLimit) * 100];
};

const getQuotaData = (
  usedQuota: Array<unknown>,
  t: TFunction,
  isAdvance = false,
): Array<MailBoxQuota> => {
  const quota: Array<MailBoxQuota> = [];
  usedQuota.forEach((item: any): void => {
    const [mailQuota, mailQuotaPercentage] = formatQuota(
      item?.mailsQuotaUsed ?? 0,
      item.mailsQuotaLimit ?? 0,
      t,
    );

    const data: Partial<MailBoxQuota> = {
      name: !isAdvance ? item?.name : item?.accountName,
      id: !isAdvance ? item?.id : item?.accountId,
      mailsQuota: mailQuota,
      mailsQuotaUsed: BytesToGB(item?.mailsQuotaUsed || 0).toFixed(2),
      mailsQuotaUsedPercentage: mailQuotaPercentage.toFixed(0),
    };

    if (isAdvance) {
      const [fileQuota, fileQuotaPercentage] = formatQuota(
        item?.filesQuotaUsed ?? 0,
        item?.filesQuotaLimit ?? 0,
        t,
      );
      data.filesQuota = fileQuota;
      data.filesQuotaUsed = BytesToGB(item?.filesQuotaUsed || 0).toFixed(2);
      data.filesQuotaUsedPercentage = fileQuotaPercentage.toFixed(0);
    }

    quota.push(data as MailBoxQuota);
  });
  return quota;
};

interface QuotaReportDownloadButtonProps {
  domainName: string;
}

const QuotaReportDownloadButton: FC<QuotaReportDownloadButtonProps> = ({ domainName }) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const isAdvanced = useIsAdvanced();

  const [isDownloadInProgress, setIsDownloadInProgress] = useState(false);
  const [isShowDownload, setIsShowDownload] = useState(false);
  const [csvQuotaData, setCsvQuotaData] = useState<Array<MailBoxQuota>>();
  const [fileStorageEnabled, setFileStorageEnabled] = useState(isAdvanced);

  const csvHeader = useMemo(() => {
    const csvheaders = [
      { label: t('label.account', 'Account'), key: 'name' },
      { label: t('label.mails_quota_gb', 'Mails Quota (GB)'), key: 'mailsQuota' },
      { label: t('label.mails_quota_used_gb', 'Mails Quota Used (GB)'), key: 'mailsQuotaUsed' },
      {
        label: t('label.mail_quota_used_percentage', 'Mails Quota Used (%)'),
        key: 'mailsQuotaUsedPercentage',
      },
    ];
    if (fileStorageEnabled) {
      csvheaders.push(
        { label: t('label.files_quota_gb', 'Files Quota (GB)'), key: 'filesQuota' },
        {
          label: t('label.files_quota_used_gb', 'Files Quota Used (GB)'),
          key: 'filesQuotaUsed',
        },
        {
          label: t('label.files_quota_used_percentage', 'Files Quota Used (%)'),
          key: 'filesQuotaUsedPercentage',
        },
      );
    }
    return csvheaders;
  }, [fileStorageEnabled, t]);

  const fetchAllQuotaForCE = useCallback(
    (name: string): Promise<Array<MailBoxQuota>> =>
      getQuotaUsage(name, 0, 0, '')
        .then((data) => {
          if (data?.account && Array.isArray(data.account)) {
            const total = data?.searchTotal ?? data.account.length;
            return getQuotaUsage(name, 0, total, '');
          }
          return { account: [] };
        })
        .then((data) => {
          if (data?.account && Array.isArray(data.account)) {
            return getQuotaData(data.account, t);
          }
          return [];
        })
        .catch((error) => {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label:
              error?.message ??
              t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
          return [];
        }),
    [createSnackbar, t],
  );

  const fetchAllQuotaForAdvance = useCallback(
    (name: string): Promise<Array<MailBoxQuota>> =>
      getQuotaUsageAdvance(name, 0, 0, '')
        .then((data) => {
          const total = data?.total ?? 0;
          if (total > 0) {
            return getQuotaUsageAdvance(name, 0, total, '');
          }
          return { accounts: [] };
        })
        .then((data) => {
          if (data?.accounts && Array.isArray(data.accounts)) {
            return getQuotaData(data.accounts, t, true);
          }
          return [];
        })
        .catch(() => {
          setFileStorageEnabled(false);
          return [];
        }),
    [t],
  );

  const downloadQuotaReport = useCallback(() => {
    setIsDownloadInProgress(true);
    const fetchFunction = fileStorageEnabled ? fetchAllQuotaForAdvance : fetchAllQuotaForCE;
    fetchFunction(domainName)
      .then((data) => {
        setIsDownloadInProgress(false);
        if (data && data.length > 0) {
          setCsvQuotaData(data);
          setIsShowDownload(true);
        }
        setTimeout(() => {
          setIsShowDownload(false);
        }, 100);
      })
      .catch(() => {
        setIsDownloadInProgress(false);
      });
  }, [fileStorageEnabled, fetchAllQuotaForAdvance, fetchAllQuotaForCE, domainName]);

  return (
    <>
      <Button
        type="outlined"
        label={t('label.download_quota_Report', 'Download Quota Report')}
        color="primary"
        onClick={downloadQuotaReport}
        disabled={isDownloadInProgress}
      />
      {isShowDownload && <DownloadCSV data={csvQuotaData} header={csvHeader} />}
    </>
  );
};

export default QuotaReportDownloadButton;
