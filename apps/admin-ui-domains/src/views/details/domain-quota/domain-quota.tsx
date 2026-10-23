/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  CustomHeaderFactory,
  FormPageLayout,
  HoverableRowFactory,
  type HoverableRowProps,
  Paging,
  Table,
  TrackNumberPerPage,
} from '@zextras/ui-components';
import { useCosList } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DESC, RECORD_DISPLAY_LIMIT } from '../../../constants';
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { useAccountListDirectory } from '../../../services/use-account-list-directory';
import { useDomainQuotaReport } from '../../../services/use-domain-quota-report';
import { QuotaReportDownloadButton } from '../domain-general-settings/quota-report-download-button';
import styles from './domain-quota.module.css';
import {
  buildAccountCosIds,
  buildAccountsQuery,
  buildQuotaRow,
  type QuotaSortOrder,
  resolveCosName,
  sortByUsedPercentage,
} from './domain-quota-rows';

const USED_PERCENTAGE_COLUMN = 'used_percentage';

type QuotaRowFactoryProps = Omit<HoverableRowProps, 'row'> & {
  row: HoverableRowProps['row'] & { isOverQuota?: boolean };
};

const QuotaRowFactory = (props: QuotaRowFactoryProps) => (
  <HoverableRowFactory {...props} rowClassName={props.row.isOverQuota ? styles.overQuota : ''} />
);

type DomainQuotaContentProps = {
  domainName: string;
};

const DomainQuotaContent = ({ domainName }: DomainQuotaContentProps) => {
  const [t] = useTranslation();
  const { data: accounts = [], isPending, error } = useDomainQuotaReport(domainName);
  const [sortOrder, setSortOrder] = useState<QuotaSortOrder>(DESC);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(RECORD_DISPLAY_LIMIT);

  useQueryErrorSnackbar(error);

  const headers = [
    { id: 'account', label: t('label.account', 'Account'), width: '30%', bold: true },
    { id: 'cos', label: t('label.cos', 'COS'), width: '15%', bold: true },
    { id: 'mails', label: t('label.mails', 'Mails'), width: '15%', bold: true },
    { id: 'files', label: t('label.files', 'Files'), width: '15%', bold: true },
    { id: 'chats', label: t('label.chats', 'Chats'), width: '15%', bold: true },
    {
      id: USED_PERCENTAGE_COLUMN,
      label: t('label.total_used_percentage', 'Total used (%)'),
      width: '10%',
      bold: true,
      sortable: true,
      onSortChange: (_id: string, order: QuotaSortOrder): void => {
        setSortOrder(order);
        setOffset(0);
      },
    },
  ];

  const sortedAccounts = sortByUsedPercentage(accounts, sortOrder);
  const pageAccounts = sortedAccounts.slice(offset, offset + limit);
  const pageEmails = pageAccounts.map((account) => account.account);

  const { data: cosList } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const { data: cosIds, isPlaceholderData: isCosIdsPlaceholder } = useAccountListDirectory(
    {
      attr: 'zimbraCOSId',
      type: 'accounts',
      query: buildAccountsQuery(pageEmails),
      offset: 0,
      limit: pageEmails.length,
      sortBy: '',
      sortAscending: '',
      select: buildAccountCosIds,
    },
    pageEmails.length > 0,
  );

  const rows = pageAccounts.map((account) =>
    buildQuotaRow(
      account,
      resolveCosName(account.account, isCosIdsPlaceholder ? undefined : cosIds, cosList?.cos),
      t,
    ),
  );

  if (isPending) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('label.account', 'Account')}
        </ds-text>
        <QuotaReportDownloadButton domainName={domainName} />
      </div>
      <Table
        rows={rows}
        headers={headers}
        showCheckbox={false}
        multiSelect={false}
        RowFactory={QuotaRowFactory}
        HeaderFactory={CustomHeaderFactory}
      />
      {rows.length === 0 && (
        <div className={styles.emptyState}>
          <ds-text as="p" weight="light" color="#828282" size="large">
            {t('label.this_list_is_empty', 'This list is empty.')}
          </ds-text>
        </div>
      )}
      {rows.length > 0 && (
        <div className={styles.pagingBar}>
          <Paging
            key={`${limit}-${sortOrder}`}
            totalItem={accounts.length}
            setOffset={setOffset}
            pageSize={limit}
          />
          <TrackNumberPerPage
            setPageSize={(size) => {
              setLimit(size);
              setOffset(0);
            }}
          />
        </div>
      )}
    </div>
  );
};

export const DomainQuota = () => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();

  return (
    <div className={styles.page}>
      <FormPageLayout title={t('label.mailbox_quota', 'Mailbox Quota')}>
        {domain?.name ? (
          <DomainQuotaContent key={domain.name} domainName={domain.name} />
        ) : (
          <ds-page-shimmer></ds-page-shimmer>
        )}
      </FormPageLayout>
    </div>
  );
};
