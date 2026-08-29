/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { STORAGES_API_BASE_URL } from '../../../constants';

interface QuotaReportDownloadButtonProps {
  domainName: string;
}

const QuotaReportDownloadButton = ({
  domainName,
}: QuotaReportDownloadButtonProps): React.JSX.Element => {
  const [t] = useTranslation();

  const downloadQuotaReport = () => {
    globalThis.location.href = `${STORAGES_API_BASE_URL}/quota/domain/report/${domainName}`;
  };

  return (
    <Button
      type="outlined"
      label={t('label.download_quota_Report', 'Download Quota Report')}
      color="primary"
      onClick={downloadQuotaReport}
    />
  );
};

export default QuotaReportDownloadButton;
