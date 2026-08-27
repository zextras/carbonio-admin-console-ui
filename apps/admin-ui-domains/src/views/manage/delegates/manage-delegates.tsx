/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import { ModalOverlay } from '@zextras/ui-components';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RECORD_DISPLAY_LIMIT } from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { domainQueryKeys } from '../../../services/domain-query-keys';
import {
  type DomainAdminAccount,
  useDomainAdminAccounts,
} from '../../../services/use-domain-admin-accounts';
import { EditAccount } from '../../edit-account/edit-account';
import { AdminAccountsPagination } from './admin-accounts-pagination';
import { AdminAccountsTable } from './admin-accounts-table';
import styles from './delegates.module.css';
import { InitDomainSection } from './init-domain-section';

export const ManageDelegates = () => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [pageLimit, setPageLimit] = useState(RECORD_DISPLAY_LIMIT);
  const [selectedAccount, setSelectedAccount] = useState<DomainAdminAccount | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const { data, isFetching } = useDomainAdminAccounts({
    domainName: domain?.name,
    offset,
    limit: pageLimit,
  });
  const accounts = data?.accounts ?? [];
  const total = data?.total ?? 0;

  const openDetailView = (account: DomainAdminAccount): void => {
    setSelectedAccount(account);
  };

  const refreshAccounts = (): void => {
    void queryClient.invalidateQueries({
      queryKey: domainQueryKeys.accountListDirectory.base(),
    });
  };

  const closeDetailView = (): void => {
    setSelectedAccount(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerBar}>
        <div className={styles.headerTitleRow}>
          <ds-text as="h1" size="medium" weight="bold" color="gray0">
            {t('label.delegates_domain_admins', 'Delegated Domain Admins')}
          </ds-text>
        </div>
        <div className={styles.dividerRow}>
          <ds-divider></ds-divider>
        </div>
        <InitDomainSection domainName={domain?.name} domainAttrs={domain?.a} />
      </div>
      <div className={styles.scrollArea}>
        <div className={styles.rightsTitleRow}>
          <ds-text as="h2" size="medium" weight="bold" color="gray0">
            {t('label.administration_rights', 'Administration Rights')}
          </ds-text>
        </div>
        <div className={styles.tablePanel}>
          <div className={styles.tableRow}>
            <AdminAccountsTable
              accounts={accounts}
              isFetching={isFetching}
              onOpenAccount={openDetailView}
              tableRef={tableRef}
            />
            {accounts.length !== 0 && (
              <AdminAccountsPagination
                total={total}
                pageSize={pageLimit}
                setOffset={setOffset}
                setPageSize={setPageLimit}
              />
            )}
            {selectedAccount !== null && (
              <ModalOverlay open maxWidth="58.75rem">
                <EditAccount
                  account={selectedAccount.item}
                  onClose={closeDetailView}
                  onSaved={refreshAccounts}
                  onDeleted={() => {
                    closeDetailView();
                    refreshAccounts();
                  }}
                  defaultTab="general"
                />
              </ModalOverlay>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
